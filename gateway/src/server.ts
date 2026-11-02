// OliveWatch AI gateway: the only service that talks to Gemini. The apps call these routes, never Gemini itself.
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from './env.js';
import { FEATURES } from './ai/config.js';
import { advisor } from './routes/advisor.js';
import { climate } from './routes/climate.js';
import { insights } from './routes/insights.js';
import { leaf } from './routes/leaf.js';
import { oil } from './routes/oil.js';
import { trace } from './routes/trace.js';

const app = express();
app.disable('x-powered-by');

// CORS: only the listed origins. Requests without an Origin header (curl, the native mobile app) are allowed.
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || env.allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('origin_not_allowed'));
    },
  }),
);

app.use(express.json({ limit: `${env.maxBodyMb}mb` }));

// Per-IP rate limit on the AI routes (separate from Gemini's own free-tier quota).
app.use(
  '/ai',
  rateLimit({
    windowMs: 60_000,
    limit: env.rateLimitPerMinute,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ error: 'gateway_rate_limited', limit: true, retry_after: 60, fallback: 'mock' }),
  }),
);

app.get('/health', (_req, res) => res.json({ ok: true, features: Object.keys(FEATURES) }));

// Non-secret view of the tuning (no system instructions, never the key).
app.get('/ai/config', (_req, res) =>
  res.json(
    Object.values(FEATURES).map((f) => ({ id: f.id, route: f.route, model: f.model, fallbackModel: f.fallbackModel, temperature: f.temperature, topP: f.topP, maxOutputTokens: f.maxOutputTokens, input: f.input, timeoutMs: f.timeoutMs, rules: f.rules })),
  ),
);

app.post(FEATURES.leaf.route, leaf);
app.post(FEATURES.oil.route, oil);
app.post(FEATURES.advisor.route, advisor);
app.post(FEATURES.climate.route, climate);
app.post(FEATURES.trace.route, trace);
app.post(FEATURES.insights.route, insights);

// Errors become normal JSON responses.
app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'payload_too_large', max_mb: env.maxBodyMb });
  if (err.message === 'origin_not_allowed') return res.status(403).json({ error: 'origin_not_allowed' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'bad_json' });
  console.error('[gateway] error:', err.message);
  res.status(500).json({ error: 'internal_error', fallback: 'mock' });
});

const server = app.listen(env.port, () => {
  console.log(`[gateway] listening on :${env.port}`);
  console.log(`[gateway] origins: ${env.allowedOrigins.join(', ') || '(none)'} | rate limit ${env.rateLimitPerMinute}/min | body max ${env.maxBodyMb} MB`);
  for (const f of Object.values(FEATURES)) console.log(`[gateway] ${f.route.padEnd(13)} ${f.model} -> ${f.fallbackModel}`);
});
// Socket-level guard on top of the per-call Gemini timeouts.
server.requestTimeout = 60_000;
