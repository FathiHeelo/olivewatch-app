// Same project as mobile/src/firebase.ts, platform/src/firebase.ts, landing/src/firebase.ts.
// A web projectId is an identifier, not a secret; Firestore security rules are the protection.
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = { projectId: 'olivewatch-ai' };

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Collections this project owns, in the order they are seeded.
export const COLLECTIONS = ['farms', 'plots', 'climate', 'mills', 'suppliers', 'batches', 'samples'];

// Turn a Firestore error into the exact thing the user must do.
export function explain(err) {
  const msg = String(err?.message ?? err);
  if (err?.code === 'permission-denied' || /PERMISSION_DENIED|Missing or insufficient/i.test(msg)) {
    return [
      'Firestore refused the request (permission-denied).',
      'Firebase console > Build > Firestore Database > Rules: the demo rules must allow reads/writes',
      '(test mode: "allow read, write: if request.time < timestamp.date(...)" with a date in the future).',
      'Rules are NOT deployed by this script. See firebase/firestore.rules.',
    ].join('\n');
  }
  if (/has not been used|is disabled|SERVICE_DISABLED|not found|NOT_FOUND|offline|unavailable/i.test(msg)) {
    return [
      'Firestore does not exist / is unreachable for project olivewatch-ai.',
      'Firebase console > Build > Firestore Database > Create database > choose "Start in test mode" > pick a location > Enable.',
      'If the console says the API is disabled, enable "Cloud Firestore API" in Google Cloud for olivewatch-ai.',
    ].join('\n');
  }
  return msg;
}

// Fast, honest connectivity test over REST (no SDK retry loop): 200 = ok, 404 = database not created,
// 403 = API disabled or rules deny. Throws an Error whose message the caller passes to explain().
export async function preflight() {
  const url = 'https://firestore.googleapis.com/v1/projects/' + firebaseConfig.projectId + '/databases/(default)/documents/farms?pageSize=1';
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 10000);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (res.ok) return;
    const body = await res.text();
    const e = new Error('REST ' + res.status + ': ' + body.slice(0, 300));
    e.code = res.status === 403 && !/SERVICE_DISABLED/.test(body) ? 'permission-denied' : 'unavailable';
    throw e;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('offline: no response from Firestore in 10s');
    throw err;
  } finally {
    clearTimeout(t);
  }
}

// Never hang forever: the SDK retries quietly when the backend is unreachable.
// Promise.race against a 10 second timer; the scripts then print the error and process.exit(1).
export function withTimeout(promise, ms = 10000) {
  let timer;
  const timeout = new Promise((_, rej) => {
    timer = setTimeout(() => rej(new Error(`offline: no response from Firestore in ${ms / 1000}s (database missing, API disabled, or rules deny)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
