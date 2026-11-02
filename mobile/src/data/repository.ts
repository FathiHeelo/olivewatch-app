import { onValue, ref } from 'firebase/database';
import { db } from '../firebase';
import { climateStressIndex } from './climate';
import seed from './seed.json';

// Every record carries where it came from, so the UI can show the honest label.
export type Source = 'حقيقية' | 'تجريبية' | 'محاكاة';

export type PlotStatus = 'healthy' | 'needs_check';

export type Plot = {
  id: string;
  name: string;
  trees: number;
  status: PlotStatus;
  lastCheck: string; // ready-to-show Arabic text
  lastCheckDays: number;
  source: Source;
};

export type Farm = {
  id: string;
  name: string;
  areaDunum: number;
  trees: number;
  varieties: string;
};

export type Climate = {
  dT: number; // °C anomaly vs 2005–2024
  dP: number; // mm rainfall anomaly
  dryDays: number;
  csi: number; // never stored: recomputed from dT, dP, dryDays
  baseline: string;
  source: Source;
  provider: string;
};

export type HomeData = { farm: Farm; plots: Plot[]; climate: Climate };

// The data layer is behind one interface. The Realtime Database implementation subscribes with onValue, so
// screens update live. If nothing arrives within 5 s (or the read is denied) the app falls back to the bundled
// seed.json and says so in the console.
export type Unsubscribe = () => void;

export interface Repository {
  subscribeHome(onData: (data: HomeData) => void): Unsubscribe;
  subscribeClimate(onData: (climate: Climate) => void): Unsubscribe;
}

const FALLBACK_AFTER_MS = 5000;
const FARM_ID = 'farm-east';

type ClimateInputs = Omit<Climate, 'csi'>;

// Only the inputs are stored; the CSI is always recomputed here.
function toClimate(raw: ClimateInputs): Climate {
  return { ...raw, csi: climateStressIndex(raw.dT, raw.dP, raw.dryDays) };
}

const seedFarm = (seed.farms as Record<string, Omit<Farm, 'id'>>)[FARM_ID];
const seedHome: HomeData = {
  farm: { id: FARM_ID, ...seedFarm },
  plots: Object.entries(seed.plots as Record<string, Omit<Plot, 'id'>>).map(([id, p]) => ({ ...p, id })),
  climate: toClimate(seed.climate.latest as ClimateInputs),
};

// Realtime Database returns an object keyed by id (or nothing at all): normalise to a list.
function toPlots(val: Record<string, Omit<Plot, 'id'> & { farmId?: string }> | null): Plot[] {
  return Object.entries(val ?? {})
    .filter(([, p]) => !p.farmId || p.farmId === FARM_ID)
    .map(([id, p]) => ({ ...p, id }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function warnFallback(reason: string) {
  console.warn(`[OliveWatch] using local sample data: ${reason}`);
}

const noAnswer = `no answer from Realtime Database after ${FALLBACK_AFTER_MS / 1000}s`;

class RealtimeRepository implements Repository {
  subscribeHome(onData: (data: HomeData) => void): Unsubscribe {
    const got: { farm?: Farm; plots?: Plot[]; climate?: Climate } = {};
    const complete = () => !!(got.farm && got.plots && got.climate);
    const emit = () => {
      if (got.farm && got.plots && got.climate) onData({ farm: got.farm, plots: got.plots, climate: got.climate });
    };
    const fail = (e: Error) => {
      warnFallback(e.message);
      onData(seedHome);
    };
    const timer = setTimeout(() => {
      if (!complete()) {
        warnFallback(noAnswer);
        onData(seedHome);
      }
    }, FALLBACK_AFTER_MS);

    const offs = [
      onValue(
        ref(db, `farms/${FARM_ID}`),
        (s) => {
          got.farm = s.exists() ? { id: FARM_ID, ...s.val() } : seedHome.farm;
          emit();
        },
        fail,
      ),
      onValue(
        ref(db, 'plots'),
        (s) => {
          got.plots = toPlots(s.val());
          emit();
        },
        fail,
      ),
      onValue(
        ref(db, 'climate/latest'),
        (s) => {
          got.climate = s.exists() ? toClimate(s.val()) : seedHome.climate;
          emit();
        },
        fail,
      ),
    ];
    return () => {
      clearTimeout(timer);
      offs.forEach((off) => off());
    };
  }

  subscribeClimate(onData: (climate: Climate) => void): Unsubscribe {
    let arrived = false;
    const timer = setTimeout(() => {
      if (!arrived) {
        warnFallback(noAnswer);
        onData(seedHome.climate);
      }
    }, FALLBACK_AFTER_MS);
    const off = onValue(
      ref(db, 'climate/latest'),
      (s) => {
        arrived = true;
        onData(s.exists() ? toClimate(s.val()) : seedHome.climate);
      },
      (e) => {
        warnFallback(e.message);
        onData(seedHome.climate);
      },
    );
    return () => {
      clearTimeout(timer);
      off();
    };
  }
}

export function getRepository(): Repository {
  return new RealtimeRepository();
}
