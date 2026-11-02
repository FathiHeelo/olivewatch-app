// Rules that are enforced in code, not in the prompt.
import type { z } from 'zod';
import { FEATURES } from './config.js';
import { applyGlossary } from './glossary.js';
import type { leafSchema, oilSchema } from './schemas.js';

export const DATA_SOURCE = 'gemini' as const;

// ---- leaf ---------------------------------------------------------------------------------------------------
export const LEAF_FLOOR = FEATURES.leaf.rules.minConfidence ?? 0.7; // tuned in config.ts

export type LeafOut =
  | { label: 'healthy' | 'peacock_spot' | 'aculus_olearius'; confidence: number; quality: 'good' | 'acceptable'; rejected: false; data_source: typeof DATA_SOURCE }
  | { label: 'rejected'; confidence: number; quality: 'good' | 'acceptable' | 'poor'; rejected: true; reason: 'blur' | 'low_confidence'; message: string; data_source: typeof DATA_SOURCE };

const retake = { ar: 'الصورة غير واضحة، أعد التصوير', en: 'Unclear image, please retake' };

/** Confidence below 0.70, poor quality or a "rejected" label all become the "unclear image, retake" state. */
export function finishLeaf(r: z.infer<typeof leafSchema>, lang: 'ar' | 'en'): LeafOut {
  if (r.label === 'rejected' || r.quality === 'poor' || r.confidence < LEAF_FLOOR) {
    return { label: 'rejected', confidence: r.confidence, quality: r.quality, rejected: true, reason: r.quality === 'poor' ? 'blur' : 'low_confidence', message: retake[lang], data_source: DATA_SOURCE };
  }
  return { label: r.label, confidence: r.confidence, quality: r.quality, rejected: false, data_source: DATA_SOURCE };
}

/** Safe state when the model's output could not be validated. */
export const leafUnclear = (lang: 'ar' | 'en'): LeafOut => ({ label: 'rejected', confidence: 0, quality: 'poor', rejected: true, reason: 'low_confidence', message: retake[lang], data_source: DATA_SOURCE });

// ---- oil ----------------------------------------------------------------------------------------------------
export const OIL_FLOOR = FEATURES.oil.rules.minConfidence ?? 0.6; // tuned in config.ts

export type OilOut =
  | { label: 'reference' | 'anomalous' | 'adulteration_indicator'; confidence: number; rejected: false; needs_lab: false; data_source: typeof DATA_SOURCE }
  | { rejected: true; needs_lab: true; confidence: number; message: string; data_source: typeof DATA_SOURCE };

const lab = { ar: 'يحتاج تحقق مخبري', en: 'Needs laboratory verification' };

/** Below 0.60 no class is named at all: only "needs laboratory verification". */
export function finishOil(r: z.infer<typeof oilSchema>, lang: 'ar' | 'en'): OilOut {
  if (r.confidence < OIL_FLOOR) return { rejected: true, needs_lab: true, confidence: r.confidence, message: lab[lang], data_source: DATA_SOURCE };
  return { label: r.label, confidence: r.confidence, rejected: false, needs_lab: false, data_source: DATA_SOURCE };
}

export const oilNeedsLab = (lang: 'ar' | 'en'): OilOut => ({ rejected: true, needs_lab: true, confidence: 0, message: lab[lang], data_source: DATA_SOURCE });

// ---- the model may not introduce numbers --------------------------------------------------------------------
const toWestern = (s: string) => s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
const numberTokens = (s: string) => (toWestern(s).match(/\d+(?:[.,]\d+)?/g) ?? []).map((t) => String(Number(t.replace(',', '.'))));

/**
 * climate / trace / insights: every number in the model's text must already be in the input (the app computed it).
 * Small integers up to 10 are tolerated so "three steps" or "step 2" do not trip the guard.
 * Returns the offending numbers (empty = ok).
 */
export function foreignNumbers(output: string[], input: unknown): string[] {
  const allowed = new Set(numberTokens(JSON.stringify(input)));
  const bad = new Set<string>();
  for (const text of output) {
    for (const t of numberTokens(text)) {
      if (!allowed.has(t) && !(Number.isInteger(Number(t)) && Number(t) <= 10)) bad.add(t);
    }
  }
  return [...bad];
}

// ---- images -------------------------------------------------------------------------------------------------
const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8,
  'image/png': (b) => b[0] === 0x89 && b.subarray(1, 4).toString('ascii') === 'PNG',
  'image/webp': (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Decodes the base64 and checks size + magic bytes so only real JPEG/PNG/WebP files reach the model. */
export function checkImage(base64: string, mime: string): { ok: true; bytes: number } | { ok: false; status: number; error: string } {
  const clean = base64.replace(/^data:[^,]+,/, '');
  const buf = Buffer.from(clean, 'base64');
  if (buf.length > MAX_IMAGE_BYTES) return { ok: false, status: 413, error: 'image_too_large' };
  if (!SIGNATURES[mime]?.(buf)) return { ok: false, status: 415, error: 'unsupported_or_corrupt_image' };
  return { ok: true, bytes: buf.length };
}

// ---- text normalisation (code-enforced) -----------------------------------------------------------------------
// The Climate Stress Index is a 0-100 score, never a percentage. Models sometimes write "CSI 46.7%": rewrite it.
const CSI_MENTION = '(?:CSI|Climate Stress Index|مؤشر الإجهاد المناخي)(?:\\s*\\([^)]*\\))?';
const CSI_PERCENT = new RegExp(`(${CSI_MENTION}[^.\\n\\d]{0,60}?)(\\d+(?:\\.\\d+)?)\\s*(?:%|٪|percent|per cent|بالمئة|بالمائة|في المئة|في المائة)`, 'gi');

export function fixCsiPercent(text: string, lang: 'ar' | 'en'): string {
  return text.replace(CSI_PERCENT, (_m, pre: string, n: string) => `${pre}${n}${lang === 'ar' ? ' من 100' : ' out of 100'}`);
}

/** CSI-percent fix, then the Arabic scientific-term glossary. Applied to every text the model writes. */
export const normalizeText = (text: string, lang: 'ar' | 'en') => applyGlossary(fixCsiPercent(text, lang), lang);

export function deepNormalize<T>(value: T, lang: 'ar' | 'en'): T {
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return normalizeText(v, lang);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(value) as T;
}
