// Language switch for the dashboard. Arabic: every string is Arabic and the page is right-to-left; scientific terms
// keep their English name followed by the Arabic pronunciation in parentheses (see dictionary.ts).
// English: the English text, left-to-right. A key missing from the dictionary is shown as written.
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DICT } from './dictionary';
import { applyGlossary } from './glossary';

export type Lang = 'ar' | 'en';

type Ctx = {
  lang: Lang;
  rtl: boolean;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string) => string;
  pick: (ar: string, en: string) => string;
};

const LangContext = createContext<Ctx | null>(null);

// The choice survives a reload (localStorage); ?lang=en|ar overrides it.
function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'en' || q === 'ar') return q;
    return window.localStorage.getItem('ow-lang') === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem('ow-lang', l);
    } catch {
      /* private mode: keep it in memory */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      rtl: lang === 'ar',
      setLang,
      toggle: () => setLang(lang === 'ar' ? 'en' : 'ar'),
      // In Arabic a percentage such as 86% must stay one left-to-right run, or the sign jumps to the wrong side.
      t: (key) => {
        const v = DICT[key]?.[lang] ?? key;
        return lang === 'ar' ? applyGlossary(v, 'ar').replace(/([+-]?\d[\d.,]*%)/g, '⁦$1⁩') : v;
      },
      pick: (ar, en) => (lang === 'ar' ? ar : en),
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const v = useContext(LangContext);
  if (!v) throw new Error('useLang must be used inside <LangProvider>');
  return v;
}
