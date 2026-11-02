// Scientific terms for Arabic output: the English name followed by the Arabic pronunciation in parentheses.
// TODO: this is the gateway's own copy. The mobile (src/i18n/dictionary.ts) and platform (src/i18n/dictionary.ts)
// dictionaries embed the same terms inline; unify all three into one shared glossary package.
export const GLOSSARY: Record<string, string> = {
  NDVI: 'إن دي في آي',
  NDWI: 'إن دي دبليو آي',
  'Sentinel-2': 'سنتينل-2',
  CSI: 'سي إس آي',
  UV: 'يو في',
  EVOO: 'إي في أو أو',
  FFA: 'إف إف إيه',
  PV: 'بي في',
  IPCC: 'آي بي سي سي',
  Polyphenols: 'بوليفينولز',
  Chlorophyll: 'كلوروفيل',
  Carotene: 'كاروتين',
  'Oleic acid': 'حمض أوليك',
  Peroxide: 'بيروكسايد',
  'Spilocaea oleaginea': 'سبيلوسيا أوليجينيا',
  'Aculus olearius': 'أكولوس أوليريوس',
  Verticillium: 'فيرتيسيليوم',
  'Copper hydroxide': 'كوبر هيدروكسايد',
  'Bordeaux mixture': 'مزيج بوردو',
  QR: 'كيو آر',
};

export function glossaryRule(): string {
  const lines = Object.entries(GLOSSARY).map(([en, ar]) => `${en} (${ar})`);
  return [
    'Arabic scientific-term rule: keep scientific terms in English and put the Arabic pronunciation in parentheses right after,',
    `using exactly these forms when they appear: ${lines.join(' ، ')}.`,
    'Everything else must be written in Arabic. Use Western digits (0-9).',
  ].join(' ');
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

const escapeRe =(s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Arabic only: makes sure every glossary term is written "English (Arabic pronunciation)" even when the model
 * forgot, e.g. "(CSI)" -> "CSI (سي إس آي)" and a bare "NDVI" -> "NDVI (إن دي في آي)". English text is untouched.
 */
export function applyGlossary(text: string, lang: 'ar' | 'en'): string {
  if (lang !== 'ar') return text;
  let out = text;
  for (const [en, ar] of Object.entries(GLOSSARY)) {
    const term = escapeRe(en);
    // "(CSI)" or "(CSI - سي إس آي)" written by the model -> the plain term, re-annotated just below
    out = out.replace(new RegExp(`\\(\\s*${term}\\s*(?:[-–:]\\s*[\\u0600-\\u06FF ]+)?\\)`, 'g'), en);
    // the term, when not already followed by "(Arabic ...)"
    out = out.replace(new RegExp(`(?<![A-Za-z])${term}(?![A-Za-z])(?!\\s*\\(\\s*[\\u0600-\\u06FF])`, 'g'), `${en} (${ar})`);
    // only the pronunciation was written, "(سي إس آي)": put the English name in front of it
    const pron = escapeRe(ar);
    out = out.replace(new RegExp(`(?<!${term}\\s)\\(\\s*${pron}\\s*\\)`, 'g'), `${en} (${ar})`);
    // pronunciation written as a bare word right before the annotated term: "سي إس آي CSI (سي إس آي)" -> "CSI (سي إس آي)"
    out = out.replace(new RegExp(`${pron}\\s+(?=${term}\\s*\\(${pron}\\))`, 'g'), '');
  }
  return out;
}
