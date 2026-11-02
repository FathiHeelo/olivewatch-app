// Thin REST client for Gemini generateContent. The key travels in the x-goog-api-key header (never in the URL, so it
// cannot end up in logs or error messages). Errors are classified so the caller can retry / fall back.
import { env } from '../env.js';
import type { GeminiSchema } from './config.js';

export type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
export type Content = { role: 'user' | 'model'; parts: Part[] };

export type CallOptions = {
  model: string;
  system: string;
  contents: Content[];
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  thinkingBudget?: number;
  responseMimeType: 'application/json' | 'text/plain';
  responseSchema?: GeminiSchema;
  timeoutMs: number;
};

export type ErrorKind = 'rate_limit' | 'server' | 'timeout' | 'blocked' | 'bad_request' | 'model_gone' | 'auth' | 'network';

export class GeminiError extends Error {
  constructor(
    public kind: ErrorKind,
    public status: number,
    message: string,
    public retryAfterSec?: number,
  ) {
    super(message);
  }
  /** Worth another attempt, or a different model. */
  get retryable() {
    return this.kind === 'rate_limit' || this.kind === 'server' || this.kind === 'timeout' || this.kind === 'network';
  }
}

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
  error?: { code?: number; status?: string; message?: string; details?: { retryDelay?: string }[] };
};

const parseDelay = (d?: string) => {
  const m = d?.match(/([\d.]+)s/);
  return m ? Math.ceil(Number(m[1])) : undefined;
};

export async function callGemini(o: CallOptions): Promise<{ text: string; model: string; usage?: GeminiResponse['usageMetadata'] }> {
  const generationConfig: Record<string, unknown> = {
    temperature: o.temperature,
    topP: o.topP,
    maxOutputTokens: o.maxOutputTokens,
    responseMimeType: o.responseMimeType,
  };
  if (o.responseSchema) generationConfig.responseSchema = o.responseSchema;
  // "Thinking" is only configurable this way on the 2.5 family; other models are left at their defaults.
  if (o.thinkingBudget !== undefined && o.model.startsWith('gemini-2.5')) generationConfig.thinkingConfig = { thinkingBudget: o.thinkingBudget };

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), o.timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${env.geminiBaseUrl}/models/${o.model}:generateContent`, {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.geminiKey! },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: o.system }] }, contents: o.contents, generationConfig }),
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new GeminiError('timeout', 504, `Gemini did not answer within ${o.timeoutMs} ms`);
    throw new GeminiError('network', 502, 'Could not reach Gemini');
  } finally {
    clearTimeout(timer);
  }

  let body: GeminiResponse = {};
  try {
    body = (await res.json()) as GeminiResponse;
  } catch {
    /* non-JSON error page */
  }

  if (!res.ok) {
    const msg = body.error?.message?.slice(0, 200) ?? `HTTP ${res.status}`;
    const retryAfter = parseDelay(body.error?.details?.find((d) => d.retryDelay)?.retryDelay);
    if (res.status === 429) throw new GeminiError('rate_limit', 429, msg, retryAfter);
    if (res.status === 404) throw new GeminiError('model_gone', 404, msg);
    if (res.status === 401 || res.status === 403) throw new GeminiError('auth', res.status, 'Gemini rejected the API key');
    if (res.status >= 500) throw new GeminiError('server', res.status, msg);
    throw new GeminiError('bad_request', res.status, msg);
  }

  if (body.promptFeedback?.blockReason) throw new GeminiError('blocked', 422, `Blocked: ${body.promptFeedback.blockReason}`);
  const cand = body.candidates?.[0];
  if (cand?.finishReason === 'SAFETY' || cand?.finishReason === 'PROHIBITED_CONTENT') throw new GeminiError('blocked', 422, `Blocked: ${cand.finishReason}`);
  const text = cand?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!text.trim()) throw new GeminiError('server', 502, `Empty answer (finishReason ${cand?.finishReason ?? 'none'})`);
  return { text, model: o.model, usage: body.usageMetadata };
}
