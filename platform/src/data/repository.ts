// Live data layer over Firebase Realtime Database. Every read is an onValue subscription that returns an
// unsubscribe function, so pages update the moment a record changes.
import { onValue, ref, set, update } from 'firebase/database';
import { db } from '../firebase';
import fallbackJson from './mill-data.json';
import { Batch, Mill, MillData, Sample, Supplier } from './types';

export type Unsubscribe = () => void;
type OnError = (e: Error) => void;

// Realtime Database gives an object keyed by id, or null when the node is empty.
function toList<T extends { id: string }>(val: Record<string, Omit<T, 'id'>> | null): T[] {
  return Object.entries(val ?? {}).map(([id, v]) => ({ ...v, id }) as T);
}

function subscribeList<T extends { id: string }>(path: string, onData: (rows: T[]) => void, onError: OnError): Unsubscribe {
  return onValue(ref(db, path), (s) => onData(toList<T>(s.val())), onError);
}

export const subscribeBatches = (cb: (b: Batch[]) => void, err: OnError) => subscribeList<Batch>('batches', cb, err);
export const subscribeSuppliers = (cb: (s: Supplier[]) => void, err: OnError) => subscribeList<Supplier>('suppliers', cb, err);
export const subscribeSamples = (cb: (s: Sample[]) => void, err: OnError) => subscribeList<Sample>('samples', cb, err);
export const subscribeMill = (cb: (m: Mill | null) => void, err: OnError): Unsubscribe =>
  subscribeList<Mill>('mills', (rows) => cb(rows[0] ?? null), err);

// Writes. The caller has already checked that the database is live.
export function addBatch(batch: Batch): Promise<void> {
  const { id, ...rest } = batch;
  return set(ref(db, `batches/${id}`), rest);
}

// Records that a lab check was requested for this batch. It is an internal note: nothing is sent to a lab.
export function requestLabCheck(batchId: string, isoDate: string): Promise<void> {
  return update(ref(db, `batches/${batchId}`), { labRequestedAt: isoDate });
}

const raw = fallbackJson as unknown as {
  mill: Mill;
  suppliers: Record<string, Omit<Supplier, 'id'>>;
  batches: Record<string, Omit<Batch, 'id'>>;
  samples: Record<string, Omit<Sample, 'id'>>;
  ndvi: { season2026: { date: string; value: number }[] };
};

// Bundled copy of firebase/mill-data.json, shown (with a visible warning) when the database does not answer.
export const fallbackData: MillData = {
  mill: raw.mill,
  suppliers: toList<Supplier>(raw.suppliers),
  batches: toList<Batch>(raw.batches),
  samples: toList<Sample>(raw.samples),
};

// Simulated NDVI series (chip "محاكاة" wherever it is shown). Not a Sentinel-2 retrieval.
export const ndviSeries = raw.ndvi.season2026;
