// UV scan history in the Realtime Database: uvScans/{userId}/{scanId} (see toScanRecord in ./zaytoun).
// There is no login yet, so scans are filed under the farm id the rest of the app reads. When Firebase Auth is added,
// use the signed-in user's uid here (and restrict uvScans/{uid} in database.rules.json).
import { limitToLast, onValue, push, query, ref, set } from 'firebase/database';
import { db } from '../firebase';
import type { UvScanRecord } from './zaytoun';

export const UV_USER_ID = 'farm-east';
export type StoredScan = UvScanRecord & { id: string };

/** Resolves with the new scan id, or null if the database did not confirm within 8 s. */
export async function saveUvScan(rec: UvScanRecord): Promise<string | null> {
  try {
    const node = push(ref(db, `uvScans/${UV_USER_ID}`));
    await Promise.race([set(node, rec), new Promise((_r, reject) => setTimeout(() => reject(new Error('timeout')), 8000))]);
    return node.key;
  } catch {
    return null;
  }
}

/** Live list of the last 100 scans, newest first. */
export function subscribeUvScans(onData: (scans: StoredScan[]) => void, onError?: () => void) {
  return onValue(
    query(ref(db, `uvScans/${UV_USER_ID}`), limitToLast(100)),
    (snap) => {
      const list: StoredScan[] = [];
      snap.forEach((child) => {
        const v = child.val() as Partial<UvScanRecord> | null;
        if (v && typeof v.at === 'number') list.push({ ...(v as UvScanRecord), retake: v.retake ?? [], id: child.key ?? '' });
      });
      onData(list.sort((a, b) => b.at - a.at));
    },
    () => onError?.(),
  );
}
