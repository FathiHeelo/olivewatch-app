// Calls to the ML service (FastAPI from the ML Build Plan). If EXPO_PUBLIC_ML_URL is not
// set, or the call fails, a deterministic mock answers and is labelled "محاكاة".
import type { Source } from './repository';

const ML_URL = process.env.EXPO_PUBLIC_ML_URL;

export type LeafLabel = 'healthy' | 'peacock_spot' | 'aculus_olearius';

export type LeafResult =
  | { kind: 'ok'; label: LeafLabel; confidence: number; quality: 'good' | 'acceptable'; source: Source }
  | { kind: 'rejected'; reason: 'blur' | 'low_confidence'; source: Source };

export type OilClass = 'reference' | 'anomalous' | 'adulteration_indicator';
export type OilResult =
  | { kind: 'class'; label: OilClass; confidence: number; source: Source }
  | { kind: 'lab'; confidence: number; source: Source };

// Confidence floors from the ML plan.
export const LEAF_CONFIDENCE_FLOOR = 0.7;
export const OIL_CONFIDENCE_FLOOR = 0.6;

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export async function predictLeaf(uri: string): Promise<LeafResult> {
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
export async function predictOil(uri: string): Promise<OilResult> {
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
