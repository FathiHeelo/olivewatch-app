// The last REAL leaf scan of this session (not persisted). Written by the diagnosis screen when a result arrives, read
// by the scan screen's "Recent Diagnostic" card. Nothing here is a hard-coded result.
import type { LeafResult } from './ml';

export type LastScan = { at: number; uri: string; result: LeafResult; ms: number };

let last: LastScan | null = null;
const listeners = new Set<() => void>();

export const getLastScan = () => last;

export function setLastScan(v: LastScan) {
  last = v;
  listeners.forEach((l) => l());
}

export function subscribeLastScan(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
