// Leaf / oil screening. Priority order: (1) the AI gateway (EXPO_PUBLIC_AI_URL, Gemini, labelled "Gemini · فحص أولي"),
// (2) the FastAPI ML service (EXPO_PUBLIC_ML_URL), (3) a deterministic mock labelled "محاكاة".
import { aiLeaf, aiOil } from './aiClient';
import type { Source } from './repository';

// 'gemini' = a Gemini preliminary screening (not a trained classifier, never "real").
export type MlSource = Source | 'gemini';

const ML_URL = process.env.EXPO_PUBLIC_ML_URL;

export type LeafLabel = 'healthy' | 'peacock_spot' | 'aculus_olearius';

export type LeafResult =
  | { kind: 'ok'; label: LeafLabel; confidence: number; quality: 'good' | 'acceptable'; source: MlSource }
  | { kind: 'rejected'; reason: 'blur' | 'low_confidence'; source: MlSource };

export type OilClass = 'reference' | 'anomalous' | 'adulteration_indicator';
export type OilResult =
  | { kind: 'class'; label: OilClass; confidence: number; source: MlSource }
  | { kind: 'lab'; confidence: number; source: MlSource };

// Confidence floors from the ML plan.
export const LEAF_CONFIDENCE_FLOOR = 0.7;
export const OIL_CONFIDENCE_FLOOR = 0.6;

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
  if (h % 5 === 0) return { kind: 'rejected', reason: 'blur', source: 'محاكاة' };
  const labels: LeafLabel[] = ['peacock_spot', 'healthy', 'aculus_olearius'];
  return {
    kind: 'ok',
    label: labels[h % 3],
    confidence: 0.74 + ((h % 19) / 100),
    quality: h % 2 ? 'good' : 'acceptable',
    source: 'محاكاة',
  };
}

// UV oil screening: a photo of the oil sample taken under a UV torch in a dark room.
// Real service: POST {ML_URL}/predict/oil (field `file`) -> { label, confidence, data_source }.
// Without the service a deterministic mock answers and is labelled "محاكاة".
export async function predictOil(uri: string, lang: 'ar' | 'en' = 'ar'): Promise<OilResult> {
  // 1) AI gateway. Below 0.60 the gateway names no class: it answers needs_lab.
  const ai = await aiOil(uri, lang);
  if (ai.ok) {
    if (ai.data.rejected) return { kind: 'lab', confidence: ai.data.confidence, source: 'gemini' };
    return { kind: 'class', label: ai.data.label, confidence: ai.data.confidence, source: 'gemini' };
  }
  // 2) ML service
  if (ML_URL) {
    try {
      const blob = await (await fetch(uri)).blob();
      const form = new FormData();
      form.append('file', blob as any, 'oil_uv.jpg');
      const res = await fetch(`${ML_URL}/predict/oil`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(String(res.status));
      const j = await res.json();
      const src: Source = j.data_source === 'simulated' ? 'محاكاة' : 'حقيقية';
      if (j.rejected || j.confidence < OIL_CONFIDENCE_FLOOR) return { kind: 'lab', confidence: j.confidence ?? 0, source: src };
      return { kind: 'class', label: j.label, confidence: j.confidence, source: src };
    } catch {
      // fall through to the mock
    }
  }
  await new Promise((r) => setTimeout(r, 1000));
  const h = hash(uri);
  const classes: OilClass[] = ['reference', 'anomalous', 'adulteration_indicator'];
  const confidence = 0.52 + ((h % 40) / 100);
  if (confidence < OIL_CONFIDENCE_FLOOR) return { kind: 'lab', confidence, source: 'محاكاة' };
  return { kind: 'class', label: classes[h % 3], confidence, source: 'محاكاة' };
}

// Oil screening is simulated by design (no real oil images exist for the demo).
export const oilSamples: { id: string; name: string; result: OilResult }[] = [
  { id: 'a', name: 'عينة أ', result: { kind: 'class', label: 'reference', confidence: 0.82, source: 'محاكاة' } },
  { id: 'b', name: 'عينة ب', result: { kind: 'class', label: 'anomalous', confidence: 0.71, source: 'محاكاة' } },
  { id: 'c', name: 'عينة ج', result: { kind: 'lab', confidence: 0.58, source: 'محاكاة' } },
];
