// Shared response helpers. Failures are NORMAL responses with a stable error code, never a crash, so the apps can
// show an error state or fall back to their mock (labelled simulated).
import type { Response } from 'express';
import type { ZodError } from 'zod';
import { AiUnavailable } from '../ai/run.js';

export function badRequest(res: Response, e: ZodError) {
  res.status(400).json({ error: 'bad_request', issues: e.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`) });
}

const STATUS = { rate_limited: 429, invalid_output: 502, blocked: 422, auth: 503, unavailable: 503 } as const;

/** Maps AiUnavailable to the response. `limit` tells the UI that the free-tier quota (not a bug) was the cause. */
export function sendUnavailable(res: Response, e: AiUnavailable) {
  if (e.retryAfterSec) res.setHeader('Retry-After', String(e.retryAfterSec));
  res.status(STATUS[e.reason]).json({ error: e.reason, message: e.message, limit: e.reason === 'rate_limited', retry_after: e.retryAfterSec ?? null, fallback: 'mock' });
}

export function internal(res: Response, e: unknown) {
  console.error('[gateway] unexpected error:', (e as Error).message);
  res.status(500).json({ error: 'internal_error', fallback: 'mock' });
}
