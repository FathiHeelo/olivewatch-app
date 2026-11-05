// Unit tests for the UV screening client (shared/zaytoun.ts). Run: cd gateway && npm run test:uv
// The fixtures are real responses recorded from zaytoun-backend (POST /api/analyze).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeUv, confidenceLevel, normalizeZaytoun, toScanRecord } from './zaytoun';
import { uvText } from './zaytoun-i18n';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) => JSON.parse(readFileSync(join(here, 'fixtures', name), 'utf8'));
const VALID = fixture('zaytoun-valid-uv.json');
const RECOVERED = fixture('zaytoun-recovered-daylight.json');
const INVALID = fixture('zaytoun-invalid-image.json');

type Init = { method: string; headers: Record<string, string>; body: string; signal: AbortSignal };
const answer = (status: number, body: unknown) => async (_url: string, _init: Init) => ({ ok: status < 400, status, json: async () => body });

test('success: calls POST {base}/api/analyze with the image and returns a normalized result', async () => {
  let seen: { url: string; init: Init } | undefined;
  const r = await analyzeUv('http://zv.local:8000/', 'data:image/png;base64,AAAA', {
    sampleName: 'S-12',
    fetchImpl: async (url, init) => {
      seen = { url, init };
      return { ok: true, status: 200, json: async () => VALID };
    },
  });
  assert.equal(seen?.url, 'http://zv.local:8000/api/analyze');
  assert.equal(seen?.init.method, 'POST');
  assert.deepEqual(JSON.parse(seen!.init.body), { imageUrl: 'data:image/png;base64,AAAA', sampleName: 'S-12' });
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.data.valid, true);
  assert.equal(r.data.decision, 'within_reference');
  assert.equal(r.data.confidence_level, 'medium'); // 0.762 from the backend
  assert.equal(r.data.indicators?.red, 'detected');
  assert.equal(r.data.indicators?.greenBaseline, 'present');
  assert.equal(r.data.indicators?.blue, 'not_dominant');
  assert.equal(typeof r.data.indicators?.redBlueRatio, 'number');
  assert.deepEqual(r.data.retake, []);
  assert.equal(r.data.azure, undefined);
  assert.equal(r.data.raw, VALID);
});

test('valid=false: invalid_image gives the retake state, no decision and no level', async () => {
  const r = await analyzeUv('http://zv', 'data:x', { fetchImpl: answer(200, INVALID) });
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.data.valid, false);
  assert.equal(r.data.decision, null);
  assert.equal(r.data.confidence_level, null);
  assert.equal(r.data.indicators, null);
  assert.ok(r.data.retake.includes('no_liquid'));
});

test('valid=false: a bright-background photo the backend "recovered" is treated as a retake, not a verdict', () => {
  // The backend itself returns validForAnalysis=true and a "fresh" verdict for this daylight bottle photo.
  assert.equal(RECOVERED.photoSetup.validForAnalysis, true);
  assert.equal(RECOVERED.photoSetup.enhancementApplied, true);
  const r = normalizeZaytoun(RECOVERED);
  assert.equal(r?.valid, false);
  assert.equal(r?.decision, null);
  assert.deepEqual(r?.retake, ['not_dark_room']);
});

test('network failure: no result, error "network"', async () => {
  const r = await analyzeUv('http://zv', 'data:x', {
    fetchImpl: async () => {
      throw new TypeError('fetch failed');
    },
  });
  assert.deepEqual(r, { ok: false, error: 'network', status: 0 });
});

test('timeout: aborts and reports "timeout"', async () => {
  const r = await analyzeUv('http://zv', 'data:x', {
    timeoutMs: 20,
    fetchImpl: (_url, init) =>
      new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted')))),
  });
  assert.deepEqual(r, { ok: false, error: 'timeout', status: 0 });
});

test('server address missing: "not_configured", nothing is fetched', async () => {
  let called = false;
  const r = await analyzeUv('  ', 'data:x', {
    fetchImpl: async () => {
      called = true;
      return { ok: true, status: 200, json: async () => VALID };
    },
  });
  assert.deepEqual(r, { ok: false, error: 'not_configured', status: 0 });
  assert.equal(called, false);
});

test('HTTP errors and non-Zaytoun answers never become a result', async () => {
  assert.deepEqual(await analyzeUv('http://zv', 'data:x', { fetchImpl: answer(400, { detail: 'Could not decode image.' }) }), { ok: false, error: 'bad_image', status: 400 });
  assert.deepEqual(await analyzeUv('http://zv', 'data:x', { fetchImpl: answer(500, {}) }), { ok: false, error: 'server', status: 500 });
  // e.g. a deployed URL that answers with the web page instead of the API
  const html = async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('Unexpected token <'); } });
  assert.deepEqual(await analyzeUv('http://zv', 'data:x', { fetchImpl: html }), { ok: false, error: 'bad_response', status: 200 });
  assert.deepEqual(await analyzeUv('http://zv', 'data:x', { fetchImpl: answer(200, { status: 'ok' }) }), { ok: false, error: 'bad_response', status: 200 });
});

test('every decision category maps to an honest decision', () => {
  const as = (category: string) => normalizeZaytoun({ ...VALID, category })?.decision;
  assert.equal(as('fresh_evoo'), 'within_reference');
  assert.equal(as('real_but_aged'), 'aging_flagged');
  assert.equal(as('expired_olive_oil'), 'oxidation_flagged');
  assert.equal(as('fake_or_refined'), 'suspicion_flagged');
  assert.equal(normalizeZaytoun({ ...VALID, category: 'something_new' }), null);
});

test('confidence is a qualitative level; uncalibrated never reads "high"', () => {
  assert.equal(confidenceLevel(0.9, true), 'high');
  assert.equal(confidenceLevel(0.9, false), 'medium');
  assert.equal(confidenceLevel(0.7, false), 'medium');
  assert.equal(confidenceLevel(0.4, true), 'low');
  assert.equal(confidenceLevel(85, true), 'high'); // 0-100 input is accepted too
});

test('the Firebase record holds no backend verdict text, scores or keys', () => {
  const r = normalizeZaytoun(VALID)!;
  const rec = toScanRecord(r, 'mobile', { sampleId: ' S-9 ', batchId: '' });
  assert.equal(rec.sampleId, 'S-9');
  assert.equal('batchId' in rec, false);
  const text = JSON.stringify(rec);
  for (const banned of ['purity', 'fakeProbability', 'authentic', 'EVOO', 'verdict', 'key']) assert.ok(!text.toLowerCase().includes(banned.toLowerCase()), banned);
});

test('UI strings: no accuracy figures and no forbidden claims, both languages; the notice is exact', () => {
  for (const lang of ['ar', 'en'] as const) {
    const all = JSON.stringify(uvText(lang));
    assert.ok(!/\d+(\.\d+)?\s*%/.test(all), `${lang}: a percentage figure`);
    for (const w of ['96.2', '88.7', 'pure ', 'purity', 'adulteration-free', 'guaranteed', 'fit for consumption', 'antioxidant', 'نقي', 'خالٍ من الغش', 'مضمون']) {
      assert.ok(!all.toLowerCase().includes(w.toLowerCase()), `${lang}: "${w}"`);
    }
  }
  assert.equal(uvText('en').notice, 'Preliminary screening aid. Not an accredited laboratory test and not proof of oil authenticity.');
});
