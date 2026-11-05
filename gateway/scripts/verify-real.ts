// Hits every route of a RUNNING gateway with real requests (real Gemini, real key). Needs the gateway on GATEWAY_URL
// (default http://localhost:8787). Assertions check status codes, structure and the code-enforced rules; they do not
// assert exact labels, because the model's answer is not deterministic.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = process.env.GATEWAY_URL ?? 'http://localhost:8787';
const dir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const b64 = (f: string) => readFileSync(join(dir, f)).toString('base64');
const mime = (f: string) => (f.endsWith('.png') ? 'image/png' : 'image/jpeg');

let failed = 0;
const check = (ok: boolean, what: string) => {
  if (!ok) failed++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${what}`);
};

async function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  const t0 = Date.now();
  const res = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const json = (await res.json().catch(() => null)) as Record<string, any> | null;
  return { status: res.status, json, ms: Date.now() - t0 };
}
const show = (title: string, r: { status: number; json: unknown; ms: number }) => console.log(`\n${title}  -> HTTP ${r.status} (${r.ms} ms)\n  ${JSON.stringify(r.json).slice(0, 520)}`);

const imgBody = (f: string, lang = 'en') => ({ lang, imageBase64: b64(f), mimeType: mime(f) });

console.log(`Gateway: ${BASE}`);
const health = await fetch(`${BASE}/health`).then((r) => r.json());
console.log('health', JSON.stringify(health));

// ---- leaf -----------------------------------------------------------------------------------------------------
for (const [f, note] of [['leaf-spots.jpg', 'leaf with spots'], ['leaf-branch.jpg', 'olive branch photo'], ['uv-synthetic.png', 'NOT a leaf (UV vial)']] as const) {
  const r = await post('/ai/leaf', imgBody(f));
  show(`/ai/leaf  [${note}]`, r);
  check(r.status === 200 && r.json?.data_source === 'gemini', 'status 200, data_source = gemini');
  check(['healthy', 'peacock_spot', 'aculus_olearius', 'rejected'].includes(r.json?.label), 'label is in the contract');
  check(typeof r.json?.confidence === 'number' && typeof r.json?.rejected === 'boolean', 'confidence + rejected present');
  if (r.json && r.json.confidence < 0.7) check(r.json.rejected === true && r.json.label === 'rejected', 'confidence < 0.70 => rejected (retake)');
  if (r.json?.rejected === false) check(r.json.confidence >= 0.7, 'accepted results are >= 0.70');
}
const leafAr = await post('/ai/leaf', imgBody('leaf-spots.jpg', 'ar'));
show('/ai/leaf  [Arabic]', leafAr);
check(leafAr.status === 200, 'Arabic request works');

// ---- advisor --------------------------------------------------------------------------------------------------
const adv = await post('/ai/advisor', { lang: 'ar', messages: [{ role: 'user', text: 'هل يؤثر رش النحاس على حموضة الزيت؟' }], context: { alert: 'Peacock Spot risk in Plot 4B', csi: 46.7 } });
show('/ai/advisor  [ar + context]', adv);
check(adv.status === 200 && typeof adv.json?.reply === 'string' && /[؀-ۿ]/.test(adv.json.reply), 'Arabic reply');
const advEn = await post('/ai/advisor', { lang: 'en', messages: [{ role: 'user', text: 'When is the best time to harvest Souri olives for oil?' }, { role: 'assistant', text: 'It depends on maturity.' }, { role: 'user', text: 'And for a more peppery oil?' }] });
show('/ai/advisor  [en, 3-turn history]', advEn);
check(advEn.status === 200 && typeof advEn.json?.reply === 'string', 'English multi-turn reply');

// ---- climate --------------------------------------------------------------------------------------------------
const clim = await post('/ai/climate', { lang: 'en', facts: { csi: 46.7, dT: 2, dP: -20, dryDays: 10, scenarios: [{ name: 'heatwave', dT: 3.5, dP: -30, dryDays: 15, csi: 68.8 }] } });
show('/ai/climate  [en, scenario]', clim);
check(clim.status === 200 && clim.json?.headline && Array.isArray(clim.json?.caveats), 'structured narration');
const climAr = await post('/ai/climate', { lang: 'ar', facts: { csi: 46.7, dT: 2, dP: -20, dryDays: 10 } });
show('/ai/climate  [ar]', climAr);
const arText = JSON.stringify(climAr.json);
check(climAr.status === 200 && /CSI \(سي إس آي\)/.test(arText) && !/\bCSI\b(?!\s*\(\s*[؀-ۿ])/.test(arText), 'Arabic: every CSI carries its pronunciation (code-enforced)');

// ---- trace ----------------------------------------------------------------------------------------------------
const tr = await post('/ai/trace', { lang: 'en', batch: { id: 'B-2026-0415', village: 'Sebastia', oliveKg: 540, oilLitres: 97, receivedAt: '2026-10-27', status: 'needs_review', screening: { result: 'needs_lab', confidence: 0.58 } } });
show('/ai/trace  [en]', tr);
check(tr.status === 200 && Array.isArray(tr.json?.notes) && tr.json.notes.length === 2, 'code-added honesty notes present (QR + screening)');

// ---- insights -------------------------------------------------------------------------------------------------
const ins = await post('/ai/insights', { lang: 'ar', data: { alerts: [{ type: 'peacock_spot_risk', plot: '4B', humidityPct: 86 }], plotsNeedingCheck: [{ name: 'Plot B', lastCheckDays: 3 }], csi: 46.7 } });
show('/ai/insights  [ar]', ins);
check(ins.status === 200 && ['high', 'medium', 'low'].includes(ins.json?.priority) && ins.json?.action, 'priority + reason + action');

// ---- input validation / limits --------------------------------------------------------------------------------
console.log('\n--- validation and limits');
let r = await post('/ai/leaf', { lang: 'en' });
check(r.status === 400, `missing image => 400 (got ${r.status})`);
r = await post('/ai/leaf', { lang: 'en', imageBase64: Buffer.from('this is not an image '.repeat(20)).toString('base64'), mimeType: 'image/jpeg' });
check(r.status === 415, `corrupt "image" => 415 (got ${r.status})`);
r = await post('/ai/leaf', { lang: 'en', imageBase64: 'A'.repeat(6 * 1024 * 1024), mimeType: 'image/jpeg' });
check(r.status === 413, `oversized body (6 MB) => 413 (got ${r.status})`);
r = await post('/ai/advisor', { lang: 'en', messages: [{ role: 'assistant', text: 'hi' }] });
check(r.status === 400, `advisor without a final user message => 400 (got ${r.status})`);
r = await post('/ai/leaf', imgBody('leaf-spots.jpg'), { Origin: 'http://evil.example' });
check(r.status === 403, `disallowed Origin => 403 (got ${r.status})`);
const cfg = (await fetch(`${BASE}/ai/config`).then((x) => x.text()));
check(!/AQ\.|AIza|GEMINI_API_KEY/.test(cfg), '/ai/config does not leak the key');

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll real-request checks passed');
process.exit(failed ? 1 : 0);
