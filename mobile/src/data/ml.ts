// Leaf screening. Priority order: (1) the AI gateway (EXPO_PUBLIC_AI_URL, Gemini, labelled "Gemini · فحص أولي"),
// (2) the FastAPI ML service (EXPO_PUBLIC_ML_URL), (3) a deterministic mock labelled "محاكاة".
import { aiLeaf } from './aiClient';
import type { Source } from './repository';

// 'gemini' = a Gemini preliminary screening (not a trained classifier, never "real").
export type MlSource = Source | 'gemini';

const ML_URL = process.env.EXPO_PUBLIC_ML_URL;

export type LeafLabel = 'healthy' | 'peacock_spot' | 'aculus_olearius';

// Why the AI gateway was not used (only set when a mock answered): lets the screen say so, e.g. "limit reached".
export type Why = { error: string; limit: boolean; retryAfter: number | null };

export type LeafResult =
  | { kind: 'ok'; label: LeafLabel; confidence: number; quality: 'good' | 'acceptable'; source: MlSource; why?: Why }
  | { kind: 'rejected'; reason: 'blur' | 'low_confidence'; source: MlSource; why?: Why };

// Confidence floor from the ML plan.
export const LEAF_CONFIDENCE_FLOOR = 0.7;

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export async function predictLeaf(uri: string, lang: 'ar' | 'en' = 'ar'): Promise<LeafResult> {
  // 1) AI gateway. Confidence < 0.70 and poor quality are already turned into "rejected" by the gateway.
  const ai = await aiLeaf(uri, lang);
  if (ai.ok) {
    if (ai.data.rejected || ai.data.label === 'rejected') return { kind: 'rejected', reason: ai.data.reason === 'blur' ? 'blur' : 'low_confidence', source: 'gemini' };
    return { kind: 'ok', label: ai.data.label, confidence: ai.data.confidence, quality: ai.data.quality === 'good' ? 'good' : 'acceptable', source: 'gemini' };
  }
  const why: Why = { error: ai.error, limit: ai.limit, retryAfter: ai.retryAfter };
  // 2) ML service
  if (ML_URL) {
    try {
      const blob = await (await fetch(uri)).blob();
      const form = new FormData();
      form.append('file', blob as any, 'leaf.jpg');
      const res = await fetch(`${ML_URL}/predict/leaf`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(String(res.status));
      const j = await res.json();
      // Assumed response shape: { label, confidence, quality, rejected?, data_source }
      if (j.rejected || j.label === 'rejected') {
        return { kind: 'rejected', reason: j.reason === 'blur' ? 'blur' : 'low_confidence', source: 'حقيقية' };
      }
      return {
        kind: 'ok',
        label: j.label,
        confidence: j.confidence,
        quality: j.quality === 'good' ? 'good' : 'acceptable',
        source: j.data_source === 'simulated' ? 'محاكاة' : 'حقيقية',
      };
    } catch {
      // fall through to the mock
    }
  }
  await new Promise((r) => setTimeout(r, 900));
  const h = hash(uri);
  if (h % 5 === 0) return { kind: 'rejected', reason: 'blur', source: 'محاكاة', why };
  const labels: LeafLabel[] = ['peacock_spot', 'healthy', 'aculus_olearius'];
  return {
    kind: 'ok',
    label: labels[h % 3],
    confidence: 0.74 + ((h % 19) / 100),
    quality: h % 2 ? 'good' : 'acceptable',
    source: 'محاكاة',
    why,
  };
}

// UV oil screening moved to the Zaytoun Vision backend: see src/uv/zaytoun.ts and src/app/uv.tsx.
