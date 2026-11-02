// Live farm data for the dashboard home: /farms/farm-east, /plots and /climate/latest (Realtime Database).
// Same shapes as mobile/src/data/repository.ts. If nothing arrives in 5 s the bundled seed is shown.
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { climateStressIndex } from './csi';
import seed from './farm-seed.json';

export type Farm = {
  id: string;
  name: string;
  nameEn?: string;
  location?: string;
  locationEn?: string;
  areaDunum: number;
  trees: number;
  varieties: string;
  health?: number;
};
export type Plot = { id: string; name: string; nameEn?: string; trees: number; status: 'healthy' | 'needs_check'; lastCheck: string; lastCheckDays: number };
export type Climate = { dT: number; dP: number; dryDays: number; csi: number; baseline: string; provider: string };
export type Home = { farm: Farm; plots: Plot[]; climate: Climate };

const FARM_ID = 'farm-east';
const withCsi = (c: Omit<Climate, 'csi'>): Climate => ({ ...c, csi: climateStressIndex(c.dT, c.dP, c.dryDays) });

const seedHome: Home = {
  farm: { id: FARM_ID, ...(seed.farms as Record<string, Omit<Farm, 'id'>>)[FARM_ID] },
  plots: Object.entries(seed.plots as Record<string, Omit<Plot, 'id'>>).map(([id, p]) => ({ ...p, id })),
  climate: withCsi(seed.climate.latest as Omit<Climate, 'csi'>),
};

export type HomeState = { home: Home; status: 'loading' | 'live' | 'fallback' };

export function useHome(): HomeState {
  const [state, setState] = useState<HomeState>({ home: seedHome, status: 'loading' });

  useEffect(() => {
    const got: { farm?: Farm; plots?: Plot[]; climate?: Climate } = {};
    const emit = () => {
      if (got.farm && got.plots && got.climate) setState({ home: { farm: got.farm, plots: got.plots, climate: got.climate }, status: 'live' });
    };
    const fail = (e: Error) => {
      console.warn(`[OliveWatch] using local sample data: ${e.message}`);
      setState({ home: seedHome, status: 'fallback' });
    };
    const timer = setTimeout(() => {
      if (!(got.farm && got.plots && got.climate)) {
        console.warn('[OliveWatch] using local sample data: no answer from Realtime Database after 5s');
        setState({ home: seedHome, status: 'fallback' });
      }
    }, 5000);
    const offs = [
      onValue(ref(db, `farms/${FARM_ID}`), (s) => { got.farm = s.exists() ? { id: FARM_ID, ...s.val() } : seedHome.farm; emit(); }, fail),
      onValue(ref(db, 'plots'), (s) => {
        got.plots = Object.entries((s.val() ?? {}) as Record<string, Omit<Plot, 'id'>>).map(([id, p]) => ({ ...p, id })).sort((a, b) => a.id.localeCompare(b.id));
        emit();
      }, fail),
      onValue(ref(db, 'climate/latest'), (s) => { got.climate = s.exists() ? withCsi(s.val()) : seedHome.climate; emit(); }, fail),
    ];
    return () => {
      clearTimeout(timer);
      offs.forEach((off) => off());
    };
  }, []);

  return state;
}
