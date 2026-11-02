// Language switch. Arabic: every string is Arabic and the layout is right-to-left; scientific terms keep their
// English name followed by the Arabic pronunciation in parentheses (that form lives in dictionary.ts).
// English: the English text and a left-to-right layout. Strings missing from the dictionary are shown as written.
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DICT } from './dictionary';

export type Lang = 'ar' | 'en';

type Dir = {
  lang: Lang;
  rtl: boolean;
  rowDir: 'row' | 'row-reverse';
  setLang: (l: Lang) => void;
  toggle: () => void;
  tr: (s: string) => string;
  trNode: (children: React.ReactNode) => React.ReactNode;
  pick: (ar: string, en: string) => string;
  backIcon: 'arrow-left' | 'arrow-right';
  forwardIcon: 'arrow-left' | 'arrow-right';
  nextIcon: 'chevron-left' | 'chevron-right';
};

const Ctx = createContext<Dir | null>(null);

// On the web the choice survives a reload (localStorage); ?lang=en|ar overrides it. Native keeps it in memory.
function initialLang(): Lang {
  try {
    if (typeof window === 'undefined') return 'ar';
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'en' || q === 'ar') return q;
    const saved = window.localStorage.getItem('ow-lang');
    return saved === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem('ow-lang', l);
    } catch {}
  }, []);

  const tr = useCallback(
    (s: string) => {
      const key = s.replace(/\s+/g, ' ').trim();
      const hit = DICT[key];
      if (!hit) return s;
      const lead = s.match(/^\s*/)?.[0] ?? '';
      const tail = s.match(/\s*$/)?.[0] ?? '';
      const v = hit[lang];
      return v === '' ? '' : `${lead}${v}${tail}`;
    },
    [lang],
  );

  const value = useMemo<Dir>(() => {
    const rtl = lang === 'ar';
    const trNode = (children: React.ReactNode): React.ReactNode => {
      if (typeof children === 'string') return tr(children);
      if (Array.isArray(children)) return children.map((c) => (typeof c === 'string' ? tr(c) : c));
      return children;
    };
    return {
      lang,
      rtl,
      rowDir: rtl ? 'row-reverse' : 'row',
      setLang,
      toggle: () => setLang(lang === 'ar' ? 'en' : 'ar'),
      tr,
      trNode,
      pick: (ar, en) => (rtl ? ar : en),
      backIcon: rtl ? 'arrow-right' : 'arrow-left',
      forwardIcon: rtl ? 'arrow-left' : 'arrow-right',
      nextIcon: rtl ? 'chevron-left' : 'chevron-right',
    };
  }, [lang, tr, setLang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): Dir {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLang must be used inside <LangProvider>');
  return v;
}
