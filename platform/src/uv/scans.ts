// UV scan history in the Realtime Database: uvScans/{userId}/{scanId} (record shape: toScanRecord in ./zaytoun).
// There is no login yet, so a mill's scans are filed under the mill id. When Firebase Auth is added, use the signed-in
// user's uid here and restrict uvScans/{uid} to that user in database.rules.json.
import { limitToLast, onValue, push, query, ref, set } from 'firebase/database';
import { db } from '../firebase';
import type { UvScanRecord } from './zaytoun';

export const DEFAULT_MILL_ID = 'mill-nasr';
export type StoredScan = UvScanRecord & { id: string };

/** Resolves with the new scan id, or null if the database did not confirm within 8 s. */
export async function saveUvScan(userId: string, rec: UvScanRecord): Promise<string | null> {
  try {
    const node = push(ref(db, `uvScans/${userId}`));
    await Promise.race([set(node, rec), new Promise((_r, reject) => setTimeout(() => reject(new Error('timeout')), 8000))]);
    return node.key;
  } catch {
    return null;
  }
}

/** Live list of the last 300 scans of one user, newest first. */
export function subscribeUvScans(userId: string, onData: (scans: StoredScan[]) => void, onError?: () => void) {
  return onValue(
    query(ref(db, `uvScans/${userId}`), limitToLast(300)),
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
