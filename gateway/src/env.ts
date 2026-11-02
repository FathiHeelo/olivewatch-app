// Environment. The Gemini key is read ONLY here, from process.env, at startup. It is never logged, never sent to
// the apps and never written to a tracked file. The server refuses to start without it.
import 'dotenv/config';

function fail(message: string): never {
  console.error(`\n[gateway] Cannot start: ${message}\n`);
  process.exit(1);
}

const key = process.env.GEMINI_API_KEY?.trim();
if (!key) {
  fail('GEMINI_API_KEY is missing. Copy gateway/.env.example to gateway/.env and set GEMINI_API_KEY (get one at https://aistudio.google.com/apikey).');
}

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};

export const env = {
  geminiKey: key,
  port: num(process.env.PORT, 8787),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  rateLimitPerMinute: num(process.env.RATE_LIMIT_PER_MINUTE, 30),
  maxBodyMb: num(process.env.MAX_BODY_MB, 5),
  // Test hooks only: point the Gemini client at a stub server. Never set in production.
  geminiBaseUrl: process.env.GEMINI_BASE_URL?.trim() || 'https://generativelanguage.googleapis.com/v1beta',
};

if (env.allowedOrigins.length === 0) {
  console.warn('[gateway] ALLOWED_ORIGINS is empty: browsers from other origins will be blocked by CORS.');
}
