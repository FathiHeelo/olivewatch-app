// Runs one feature against Gemini with the failure policy:
//   primary model -> retry once (429 / 5xx / timeout / invalid JSON) -> that feature's fallback model -> AiUnavailable.
// Callers turn AiUnavailable into a normal error response, and the apps then use their mock (labelled simulated).
import type { FeatureConfig, Lang } from './config.js';
import { callGemini, Content, GeminiError } from './gemini.js';

export class AiUnavailable extends Error {
  constructor(
    public reason: 'rate_limited' | 'unavailable' | 'invalid_output' | 'blocked' | 'auth',
    message: string,
    public retryAfterSec?: number,
  ) {
    super(message);
  }
}

export type RunResult<T> = { data: T; model: string; usedFallback: boolean; attempts: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runFeature<T>(cfg: FeatureConfig, lang: Lang, contents: Content[], parse: (text: string) => T, extraSystem = ''): Promise<RunResult<T>> {
  const system = `${cfg.systemInstruction[lang]}${extraSystem ? `\n\n${extraSystem}` : ''}`;
  let attempts = 0;
  let lastLimit: number | undefined;
  let sawRateLimit = false;
  let sawInvalid = false;

  async function tryModel(model: string, maxTries: number): Promise<T | undefined> {
    for (let i = 0; i < maxTries; i++) {
      attempts++;
      const t0 = Date.now();
      try {
        const out = await callGemini({
          model,
          system,
          contents,
          temperature: cfg.temperature,
          topP: cfg.topP,
          maxOutputTokens: cfg.maxOutputTokens,
          thinkingBudget: cfg.thinkingBudget,
          responseMimeType: cfg.responseMimeType,
          responseSchema: cfg.responseSchema,
          timeoutMs: cfg.timeoutMs,
        });
        const parsed = parse(out.text); // throws when the JSON does not match the schema
        console.log(`[ai] ${cfg.id} ${model} ok ${Date.now() - t0}ms`);
        return parsed;
      } catch (e) {
        if (e instanceof GeminiError) {
          console.warn(`[ai] ${cfg.id} ${model} ${e.kind} (${e.status}) ${Date.now() - t0}ms`);
          if (e.kind === 'auth') throw new AiUnavailable('auth', 'The gateway API key was rejected');
          if (e.kind === 'blocked') throw new AiUnavailable('blocked', e.message);
          if (e.kind === 'rate_limit') {
            sawRateLimit = true;
            lastLimit = e.retryAfterSec ?? lastLimit;
          }
          if (!e.retryable) return undefined; // model retired / bad request: go straight to the fallback model
          if (i < maxTries - 1) await sleep(Math.min((e.retryAfterSec ?? 0.5) * 1000, 2000));
        } else {
          sawInvalid = true;
          console.warn(`[ai] ${cfg.id} ${model} invalid output (${(e as Error).message.slice(0, 80)}) ${Date.now() - t0}ms`);
        }
      }
    }
    return undefined;
  }

  let data = await tryModel(cfg.model, 2);
  let usedFallback = false;
  let model = cfg.model;
  if (data === undefined && cfg.fallbackModel !== cfg.model) {
    usedFallback = true;
    model = cfg.fallbackModel;
    data = await tryModel(cfg.fallbackModel, 1);
  }
  if (data === undefined) {
    if (sawRateLimit) throw new AiUnavailable('rate_limited', 'Gemini free-tier limit reached; try again shortly', lastLimit);
    if (sawInvalid) throw new AiUnavailable('invalid_output', 'The model did not return valid structured output');
    throw new AiUnavailable('unavailable', 'Gemini is not available right now');
  }
  return { data, model, usedFallback, attempts };
}

/** Parses the model's JSON text with a zod-like parser; strips an optional ```json fence first. */
export function parseJson<T>(text: string, schema: { parse: (v: unknown) => T }): T {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return schema.parse(JSON.parse(cleaned));
}
