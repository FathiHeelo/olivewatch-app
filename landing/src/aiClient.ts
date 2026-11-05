// Typed client for the OliveWatch AI gateway (gateway/). The landing page never talks to Gemini and never holds a key:
// it calls VITE_AI_URL. Every function resolves (never throws) with { ok: true, data } or { ok: false, ... }, so the UI
// can fall back to its simulated state when the gateway is unset, down, or the free-tier limit is reached.
const AI_URL = (import.meta.env.VITE_AI_URL as string | undefined)?.replace(/\/$/, '');

export type AiLang = 'ar' | 'en';
export type AiFail = { ok: false; error: string; status: number; limit: boolean; retryAfter: number | null };
export type AiResult<T> = { ok: true; data: T } | AiFail;

export const aiConfigured = Boolean(AI_URL);

export type LeafAi = {
  label: 'healthy' | 'peacock_spot' | 'aculus_olearius' | 'rejected';
  confidence: number;
  quality: 'good' | 'acceptable' | 'poor';
  rejected: boolean;
  reason?: 'blur' | 'low_confidence';
  message?: string;
  reason_text?: string;
  data_source: 'gemini';
};
export type AdvisorMessage = { role: 'user' | 'assistant'; text: string };
export type AdvisorAi = { reply: string; data_source: 'gemini'; model: string };
export type ClimateAi = { headline: string; explanation: string; comparison?: string[]; caveats: string[]; data_source: 'gemini' };
export type TraceAi = { title: string; summary: string; highlights: string[]; notes: string[]; data_source: 'gemini' };
export type InsightsAi = { title: string; priority: 'high' | 'medium' | 'low'; reason: string; action: string; data_source: 'gemini' };

async function post<T>(path: string, body: unknown, timeoutMs = 35_000): Promise<AiResult<T>> {
  if (!AI_URL) return { ok: false, error: 'not_configured', status: 0, limit: false, retryAfter: null };
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${AI_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) return { ok: false, error: json?.error ?? `http_${res.status}`, status: res.status, limit: Boolean(json?.limit), retryAfter: json?.retry_after ?? null };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: 'gateway_unreachable', status: 0, limit: false, retryAfter: null };
  } finally {
    clearTimeout(timer);
  }
}

/** Reads a File/Blob as raw base64 (no data: prefix). */
export async function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

const imageBody = async (file: Blob, lang: AiLang) => ({ lang, imageBase64: await fileToBase64(file), mimeType: file.type || 'image/jpeg' });

export const aiLeaf = async (file: Blob, lang: AiLang) => post<LeafAi>('/ai/leaf', await imageBody(file, lang));
export const aiAdvisor = (messages: AdvisorMessage[], lang: AiLang, context?: Record<string, unknown>) => post<AdvisorAi>('/ai/advisor', { lang, messages, context });
/** `facts` must hold numbers the app computed (CSI, scenario values); the model only narrates them. */
export const aiClimate = (facts: Record<string, unknown>, lang: AiLang) => post<ClimateAi>('/ai/climate', { lang, facts });
/** `batch` holds the batch's real fields only; the text never contains anything that is not in it. */
export const aiTrace = (batch: Record<string, unknown>, lang: AiLang) => post<TraceAi>('/ai/trace', { lang, batch });
export const aiInsights = (data: Record<string, unknown>, lang: AiLang) => post<InsightsAi>('/ai/insights', { lang, data });

/** Chip text for a result: Gemini results are "preliminary", never "real"; a mock is "simulated". */
export function sourceChip(source: 'gemini' | 'simulated', lang: AiLang): string {
  if (source === 'gemini') return lang === 'ar' ? 'Gemini · فحص أولي' : 'Gemini · Preliminary';
  return lang === 'ar' ? 'محاكاة' : 'Simulated';
}

/* Minimal usage (the landing page has no AI UI yet; the CSI demo could narrate its result like this):
 *   const r = await aiClimate({ csi: 46.7, dT: 2, dP: -20, dryDays: 10 }, 'ar');
 *   if (r.ok) show(r.data.headline, r.data.explanation); else if (r.limit) showLimitNotice(r.retryAfter); else useMock();
 *   const t = await aiTrace({ id: 'B-2026-0415', village: 'Sebastia', oliveKg: 540 }, 'en');
 */
