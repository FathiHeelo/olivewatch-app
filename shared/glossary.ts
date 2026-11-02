// SINGLE SOURCE OF TRUTH for scientific terms in Arabic mode: the English name followed by the Arabic pronunciation
// in parentheses, e.g. "NDVI (إن دي في آي)".
//
// Edit ONLY this file, then run `node shared/sync-glossary.mjs`. That copies it, unchanged, to
//   gateway/src/ai/glossary.ts   mobile/src/i18n/glossary.ts   platform/src/i18n/glossary.ts
// so each app stays independent (no cross-package imports). `node shared/sync-glossary.mjs --check` fails when a
// copy differs or when an app dictionary uses a different pronunciation for a glossary term.

export const GLOSSARY: Record<string, string> = {
  // remote sensing, climate
  NDVI: 'إن دي في آي',
  NDWI: 'إن دي دبليو آي',
  'Sentinel-2': 'سنتينل-2',
  Sentinels: 'سنتينلز',
  Copernicus: 'كوبرنيكوس',
  ECMWF: 'إي سي إم دبليو إف',
  GIS: 'جي آي إس',
  CSI: 'سي إس آي',
  IPCC: 'آي بي سي سي',
  Evapotranspiration: 'إيفابوترانسبيريشن',
  // oil chemistry
  UV: 'يو في',
  EVOO: 'إي في أو أو',
  FFA: 'إف إف إيه',
  PV: 'بي في',
  PHI: 'بي إتش آي',
  K232: 'كيه 232',
  K270: 'كيه 270',
  Polyphenols: 'بوليفينولز',
  Polyphenol: 'بوليفينول',
  Chlorophyll: 'كلوروفيل',
  Carotene: 'كاروتين',
  'Oleic acid': 'حمض أوليك',
  Oleic: 'أوليك',
  Peroxide: 'بيروكسايد',
  Phenolic: 'فينوليك',
  // plants, pathogens, treatments
  'Olea europaea': 'أوليا يوروباييا',
  'Spilocaea oleaginea': 'سبيلوسيا أوليجينيا',
  'Aculus olearius': 'أكولوس أوليريوس',
  Verticillium: 'فيرتيسيليوم',
  'Copper hydroxide': 'كوبر هيدروكسايد',
  'Bordeaux mixture': 'مزيج بوردو',
  Bordeaux: 'بوردو',
  // technology and marks
  QR: 'كيو آر',
  PDF: 'بي دي إف',
  PWA: 'بي دبليو إيه',
  LoRaWAN: 'لورا وان',
  Blockchain: 'بلوكتشين',
  'PQM-OLIVE': 'بي كيو إم أوليف',
};

export function glossaryRule(): string {
  const lines = Object.entries(GLOSSARY).map(([en, ar]) => `${en} (${ar})`);
  return [
    'Arabic scientific-term rule: keep scientific terms in English and put the Arabic pronunciation in parentheses right after,',
    `using exactly these forms when they appear: ${lines.join(' ، ')}.`,
    'Everything else must be written in Arabic. Use Western digits (0-9).',
  ].join(' ');
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const byLength = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length); // longest first: "Oleic acid" before "Oleic"
const lower = new Map(byLength.map((k) => [k.toLowerCase(), k]));

// One pass over all terms. The term must not already be followed by "(Arabic ...)".
const TERM = new RegExp(`(?<![A-Za-z0-9])(${byLength.map(escapeRe).join('|')})(?![A-Za-z0-9])(?!\\s*\\(\\s*[\\u0600-\\u06FF])`, 'gi');

/**
 * Arabic only: guarantees every glossary term is written "English (Arabic pronunciation)":
 *   "(CSI)" -> "CSI (سي إس آي)" · bare "NDVI" -> "NDVI (إن دي في آي)" · "(سي إس آي)" alone -> "CSI (سي إس آي)".
 * Idempotent, and English text is returned untouched.
 */
export function applyGlossary(text: string, lang: 'ar' | 'en'): string {
  if (lang !== 'ar') return text;
  let out = text;
  for (const [en, ar] of Object.entries(GLOSSARY)) {
    const term = escapeRe(en);
    // "(CSI)" or "(CSI - سي إس آي)" written by a model -> the plain term, re-annotated by the pass below
    out = out.replace(new RegExp(`\\(\\s*${term}\\s*(?:[-–:]\\s*[\\u0600-\\u06FF ]+)?\\)`, 'g'), en);
    // only the pronunciation was written, "(سي إس آي)": put the English name in front of it
    out = out.replace(new RegExp(`(?<!${term}\\s)\\(\\s*${escapeRe(ar)}\\s*\\)`, 'g'), `${en} (${ar})`);
  }
  out = out.replace(TERM, (m) => {
    const key = lower.get(m.toLowerCase())!;
    return `${m} (${GLOSSARY[key]})`;
  });
  // a pronunciation written as a bare word right before the annotated term: "سي إس آي CSI (سي إس آي)" -> "CSI (سي إس آي)"
  for (const [en, ar] of Object.entries(GLOSSARY)) out = out.replace(new RegExp(`${escapeRe(ar)}\\s+(?=${escapeRe(en)}\\s*\\(${escapeRe(ar)}\\))`, 'g'), '');
  return out;
}

/** applyGlossary on every string inside a JSON-like value (objects, arrays). */
export function deepGlossary<T>(value: T, lang: 'ar' | 'en'): T {
  if (lang !== 'ar') return value;
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return applyGlossary(v, 'ar');
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(value) as T;
}
