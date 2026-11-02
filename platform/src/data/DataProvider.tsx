// Subscribes once to the whole mill tree and shares it with every page through context.
// If the database has not answered within 5 s (or refuses the read) the bundled sample data is shown and
// status becomes 'fallback'. If a live answer arrives later, status flips back to 'live'.
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { fallbackData, subscribeBatches, subscribeMill, subscribeSamples, subscribeSuppliers } from './repository';
import { DataStatus, MillData } from './types';

const FALLBACK_AFTER_MS = 5000;

type Ctx = MillData & { status: DataStatus };
const DataContext = createContext<Ctx | null>(null);

type Live = Partial<{ [K in keyof MillData]: MillData[K] }>;

export function DataProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<Live>({});
  const [timedOut, setTimedOut] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const fail = (e: Error) => {
      console.warn(`[OliveWatch] using local sample data: ${e.message}`);
      setFailed(true);
    };
    const timer = setTimeout(() => {
      console.warn(`[OliveWatch] using local sample data: no answer from Realtime Database after ${FALLBACK_AFTER_MS / 1000}s`);
      setTimedOut(true);
    }, FALLBACK_AFTER_MS);
    const offs = [
      subscribeMill((mill) => setLive((l) => ({ ...l, mill })), fail),
      subscribeSuppliers((suppliers) => setLive((l) => ({ ...l, suppliers })), fail),
      subscribeBatches((batches) => setLive((l) => ({ ...l, batches })), fail),
      subscribeSamples((samples) => setLive((l) => ({ ...l, samples })), fail),
    ];
    return () => {
      clearTimeout(timer);
      offs.forEach((off) => off());
    };
  }, []);

  const value = useMemo<Ctx>(() => {
    const arrived = live.mill !== undefined && live.suppliers && live.batches && live.samples;
    if (arrived) {
      return { mill: live.mill ?? fallbackData.mill, suppliers: live.suppliers!, batches: live.batches!, samples: live.samples!, status: 'live' };
    }
    if (timedOut || failed) return { ...fallbackData, status: 'fallback' };
    return { mill: null, suppliers: [], batches: [], samples: [], status: 'loading' };
  }, [live, timedOut, failed]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useMillData(): Ctx {
  const v = useContext(DataContext);
  if (!v) throw new Error('useMillData must be used inside <DataProvider>');
  return v;
}
