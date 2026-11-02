// "Your next recommended action" from the gateway (/ai/insights). Only facts the app already holds are sent. The
// answer is cached for 10 minutes per language so reloading the dashboard does not burn the free Gemini quota; when
// the gateway is unset, down or rate-limited this returns undefined and the card keeps its static design text.
import { useEffect, useState } from 'react';
import { AiLang, aiInsights, InsightsAi } from './aiClient';
import { Home } from './farm';

const TTL_MS = 10 * 60 * 1000;

export function useInsights(home: Home, lang: AiLang): InsightsAi | undefined {
  const [ai, setAi] = useState<InsightsAi>();
  const key = `ow-insights-${lang}`;

  useEffect(() => {
    let alive = true;
    try {
      const hit = JSON.parse(sessionStorage.getItem(key) ?? 'null') as { at: number; data: InsightsAi } | null;
      if (hit && Date.now() - hit.at < TTL_MS) {
        setAi(hit.data);
        return;
      }
    } catch {
      /* no storage: just ask */
    }
    setAi(undefined);
    aiInsights(
      {
        alerts: [{ type: 'peacock_spot_risk', plot: '4B', morningHumidityPercent: 86 }],
        plotsNeedingCheck: home.plots.filter((p) => p.status === 'needs_check').map((p) => ({ name: p.nameEn ?? p.name, lastCheckDaysAgo: p.lastCheckDays })),
        climateStressIndex: { value: home.climate.csi, scale: '0-100 index (not a percentage)' },
      },
      lang,
    ).then((r) => {
      if (!alive || !r.ok) return;
      setAi(r.data);
      try {
        sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data: r.data }));
      } catch {
        /* ignore */
      }
    });
    return () => {
      alive = false;
    };
    // The plots/climate objects change identity on every database push; the values that matter are in the key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, home.climate.csi, home.plots.length]);

  return ai;
}
