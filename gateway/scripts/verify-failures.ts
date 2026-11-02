// Failure-path tests. A scripted stub replaces Gemini, the real gateway code runs unchanged.
//   missing key | 429 -> retry -> fallback model | 429 everywhere | invalid JSON | invented numbers | 5xx | block |
//   confidence floors | per-IP rate limit.
import { ChildProcess, spawn, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Scenario, startStub } from './stub-gemini.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const png = readFileSync(join(root, 'scripts/fixtures/uv-synthetic.png')).toString('base64');
let failed = 0;
const check = (ok: boolean, what: string) => {
  if (!ok) failed++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${what}`);
};

const STUB = 8899;
const PORT = 8790;
const start = (env: Record<string, string>) =>
  spawn('npx', ['tsx', 'src/server.ts'], { cwd: root, shell: true, env: { ...process.env, ALLOWED_ORIGINS: 'http://localhost:5174', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
const stop = (p: ChildProcess) => p.pid && spawnSync('taskkill', ['/pid', String(p.pid), '/T', '/F'], { stdio: 'ignore' });
const wait = async (port: number) => {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`http://localhost:${port}/health`)).ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('gateway did not start');
};
const post = async (port: number, path: string, body: unknown) => {
  const r = await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: r.status, retryAfter: r.headers.get('retry-after'), json: (await r.json().catch(() => null)) as Record<string, any> | null };
};
const img = { lang: 'en', imageBase64: png, mimeType: 'image/png' };
const climateBody = { lang: 'en', facts: { csi: 46.7, dT: 2, dP: -20, dryDays: 10 } };
const insightsBody = { lang: 'en', data: { csi: 46.7, alerts: ['peacock spot risk'] } };
const traceBody = { lang: 'en', batch: { id: 'B-1', village: 'Beita', oliveKg: 540 } };

// 1) missing key: the server must refuse to start with a clear message ----------------------------------------------
console.log('\n[1] missing GEMINI_API_KEY');
{
  const p = start({ GEMINI_API_KEY: '', PORT: '8791' });
  let out = '';
  p.stderr?.on('data', (d) => (out += d));
  const code: number | null = await new Promise((r) => {
    p.on('exit', (c) => r(c));
    setTimeout(() => r(null), 15_000);
  });
  check(code === 1 && /GEMINI_API_KEY is missing/.test(out), `exits with code 1 and a clear message (code=${code})`);
  stop(p);
}

const stub = await startStub(STUB);
const gw = start({ GEMINI_API_KEY: 'test-key-not-real', GEMINI_BASE_URL: `http://localhost:${STUB}`, PORT: String(PORT), RATE_LIMIT_PER_MINUTE: '1000' });
await wait(PORT);
const scenario = (s: Scenario) => stub.setScenario(s);
const models = () => stub.calls.map((c) => c.model).join(' > ');

// 2) 429 on the primary: retry once, then the fallback model ---------------------------------------------------------
console.log('\n[2] 429 on the primary model');
scenario('rate-primary');
let r = await post(PORT, '/ai/leaf', img);
check(r.status === 200 && r.json?.used_fallback === true && r.json?.model === 'gemini-3.5-flash-lite', `answered by the fallback model (${models()})`);
check(stub.calls.filter((c) => c.model === 'gemini-2.5-flash').length === 2, 'primary was retried exactly once before switching');

// 3) 429 everywhere: a normal 429 error state with retry hint -------------------------------------------------------
console.log('\n[3] 429 on every model');
scenario('rate-all');
r = await post(PORT, '/ai/advisor', { lang: 'en', messages: [{ role: 'user', text: 'hello' }] });
check(r.status === 429 && r.json?.error === 'rate_limited' && r.json?.limit === true && r.json?.fallback === 'mock', `HTTP ${r.status} { error: rate_limited, limit: true, fallback: mock }`);
check(r.retryAfter === '30' && r.json?.retry_after === 30, `Retry-After surfaced (${r.retryAfter})`);

// 4) invalid JSON from the model ------------------------------------------------------------------------------------
console.log('\n[4] invalid JSON from the model');
scenario('invalid-json-all');
r = await post(PORT, '/ai/leaf', img);
check(r.status === 200 && r.json?.rejected === true && r.json?.label === 'rejected' && !r.json?.model, 'leaf => "unclear image, retake" (never a label)');
r = await post(PORT, '/ai/oil', img);
check(r.status === 200 && r.json?.rejected === true && r.json?.needs_lab === true && r.json?.label === undefined, 'oil => "needs lab verification", no class');
r = await post(PORT, '/ai/climate', climateBody);
check(r.status === 502 && r.json?.error === 'invalid_output' && r.json?.fallback === 'mock', `climate => 502 invalid_output (got ${r.status})`);
scenario('invalid-then-valid');
r = await post(PORT, '/ai/leaf', img);
check(r.status === 200 && r.json?.rejected === false && stub.calls.length === 2, `invalid first answer is retried once and then accepted (${stub.calls.length} calls)`);

// 5) confidence floors are enforced in code ---------------------------------------------------------------------------
console.log('\n[5] confidence floors');
scenario('low-conf');
r = await post(PORT, '/ai/leaf', img);
check(r.json?.rejected === true && r.json?.label === 'rejected', 'leaf confidence 0.50 < 0.70 => rejected');
r = await post(PORT, '/ai/oil', img);
check(r.json?.rejected === true && r.json?.needs_lab === true && r.json?.label === undefined, 'oil confidence 0.55 < 0.60 => needs lab, class NOT named');
scenario('poor-quality');
r = await post(PORT, '/ai/leaf', img);
check(r.json?.rejected === true && r.json?.reason === 'blur', 'quality "poor" => rejected even at confidence 0.95');
scenario('ok');
r = await post(PORT, '/ai/leaf', { ...img, lang: 'ar' });
check(r.json?.rejected === false && r.json?.label === 'peacock_spot' && r.json?.data_source === 'gemini', 'valid answer passes through with data_source = gemini');

// 6) the model may not invent numbers ----------------------------------------------------------------------------------
console.log('\n[6] invented numbers');
scenario('foreign-numbers');
for (const [path, body] of [['/ai/climate', climateBody], ['/ai/trace', traceBody], ['/ai/insights', insightsBody]] as const) {
  r = await post(PORT, path, body);
  check(r.status === 502 && r.json?.error === 'invalid_output', `${path}: a number that is not in the input is rejected (HTTP ${r.status})`);
}

// 7) upstream down / blocked -------------------------------------------------------------------------------------------
console.log('\n[7] 5xx and blocked prompts');
scenario('server-error');
r = await post(PORT, '/ai/advisor', { lang: 'en', messages: [{ role: 'user', text: 'hello' }] });
check(r.status === 503 && r.json?.error === 'unavailable' && r.json?.fallback === 'mock', `Gemini 500 on both models => 503 unavailable (got ${r.status})`);
scenario('blocked');
r = await post(PORT, '/ai/advisor', { lang: 'en', messages: [{ role: 'user', text: 'hello' }] });
check(r.status === 422 && r.json?.error === 'blocked', `safety block => 422 blocked (got ${r.status})`);


// 7b) the Climate Stress Index is a 0-100 score, never a percentage ---------------------------------------------------
console.log('\n[7b] CSI is not a percentage');
scenario('csi-percent-en');
r = await post(PORT, '/ai/advisor', { lang: 'en', messages: [{ role: 'user', text: 'hello' }] });
check(/46\.7 out of 100/.test(r.json?.reply ?? '') && !/46\.7\s*%/.test(r.json?.reply ?? ''), `English: "CSI is 46.7%" becomes "46.7 out of 100" (${r.json?.reply})`);
scenario('csi-percent-ar');
r = await post(PORT, '/ai/advisor', { lang: 'ar', messages: [{ role: 'user', text: 'مرحبا' }] });
check(/46\.7 من 100/.test(r.json?.reply ?? '') && !/46\.7\s*[٪%]/.test(r.json?.reply ?? '') && /CSI \(سي إس آي\)|مؤشر الإجهاد المناخي/.test(r.json?.reply ?? ''), `Arabic: "46.7٪" becomes "46.7 من 100" (${r.json?.reply})`);

stub.close();
stop(gw);

// 8) Gemini unreachable ------------------------------------------------------------------------------------------------
console.log('\n[8] Gemini unreachable (connection refused)');
{
  const p = start({ GEMINI_API_KEY: 'test-key-not-real', GEMINI_BASE_URL: 'http://localhost:1', PORT: '8792', RATE_LIMIT_PER_MINUTE: '1000' });
  await wait(8792);
  r = await post(8792, '/ai/climate', climateBody);
  check(r.status === 503 && r.json?.error === 'unavailable', `network failure => 503 unavailable (got ${r.status})`);
  stop(p);
}

// 9) per-IP rate limit --------------------------------------------------------------------------------------------------
console.log('\n[9] per-IP rate limit (3 per minute)');
{
  const p = start({ GEMINI_API_KEY: 'test-key-not-real', GEMINI_BASE_URL: 'http://localhost:1', PORT: '8793', RATE_LIMIT_PER_MINUTE: '3' });
  await wait(8793);
  const codes: number[] = [];
  for (let i = 0; i < 5; i++) codes.push((await post(8793, '/ai/climate', climateBody)).status);
  check(codes.slice(0, 3).every((c) => c !== 429) && codes.slice(3).every((c) => c === 429), `requests 4 and 5 are limited (${codes.join(', ')})`);
  stop(p);
}

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll failure-path checks passed');
process.exit(failed ? 1 : 0);
