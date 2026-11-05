// Typed client for the OliveWatch AI gateway (gateway/). The app never talks to Gemini and never holds a key: it
// calls EXPO_PUBLIC_AI_URL (on a phone use your computer's LAN address, e.g. http://192.168.1.20:8787).
// Every function resolves (never throws) with { ok: true, data } or { ok: false, ... } so a screen can fall back
// to its simulated state when the gateway is unset, down, or the free-tier limit was reached.
const AI_URL = process.env.EXPO_PUBLIC_AI_URL?.replace(/\/$/, '');

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

/** Reads a local image URI (camera / gallery / blob:) as raw base64 plus its MIME type. Works on web and native. */
export async function uriToImage(uri: string): Promise<{ imageBase64: string; mimeType: string }> {
  const blob = await (await fetch(uri)).blob();
  const guessed = /\.png$/i.test(uri) ? 'image/png' : /\.webp$/i.test(uri) ? 'image/webp' : 'image/jpeg';
  const mimeType = ['image/jpeg', 'image/png', 'image/webp'].includes(blob.type) ? blob.type : guessed;
  const imageBase64 = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
  return { imageBase64, mimeType };
}

export async function aiLeaf(uri: string, lang: AiLang): Promise<AiResult<LeafAi>> {
  try {
    return post<LeafAi>('/ai/leaf', { lang, ...(await uriToImage(uri)) });
  } catch {
    return { ok: false, error: 'image_unreadable', status: 0, limit: false, retryAfter: null };
  }
}
export const aiAdvisor = (messages: AdvisorMessage[], lang: AiLang, context?: Record<string, unknown>) => post<AdvisorAi>('/ai/advisor', { lang, messages, context });
/** `facts` must hold numbers the app computed (CSI, scenario values); the model only narrates them. */
export const aiClimate = (facts: Record<string, unknown>, lang: AiLang) => post<ClimateAi>('/ai/climate', { lang, facts });
/** `batch` holds the batch's real fields only; the text never contains anything that is not in it. */
export const aiTrace = (batch: Record<string, unknown>, lang: AiLang) => post<TraceAi>('/ai/trace', { lang, batch });
export const aiInsights = (data: Record<string, unknown>, lang: AiLang) => post<InsightsAi>('/ai/insights', { lang, data });

/** Chip text: Gemini results are "preliminary", never "real"; a mock is "simulated". */
export function sourceChip(source: 'gemini' | 'simulated', lang: AiLang): string {
  if (source === 'gemini') return lang === 'ar' ? 'Gemini · فحص أولي' : 'Gemini · Preliminary';
  return lang === 'ar' ? 'محاكاة' : 'Simulated';
}

/* Minimal usage for screens that do not exist yet:
 *   const r = await aiClimate({ csi: climate.csi, dT: climate.dT, dP: climate.dP, dryDays: climate.dryDays }, lang);
 *   if (r.ok) <Text>{r.data.headline}</Text>  else if (r.limit) <Text>free limit reached</Text>  else use the mock.
 *   const t = await aiTrace({ id: batch.id, village: batch.village, oliveKg: batch.oliveKg }, lang);
 */
