// Same project as mobile/src/firebase.ts, platform/src/firebase.ts, landing/src/firebase.ts.
// These values are project identifiers, not secrets; Realtime Database rules are the protection.
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: 'AIzaSyBCYRSt3TAhlApo680gixvsVn1LSV5Uzu4',
  authDomain: 'olivewatch-ai.firebaseapp.com',
  databaseURL: 'https://olivewatch-ai-default-rtdb.firebaseio.com',
  projectId: 'olivewatch-ai',
  storageBucket: 'olivewatch-ai.firebasestorage.app',
  messagingSenderId: '212803003223',
  appId: '1:212803003223:web:ef680d9643a492973cd412',
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Top-level nodes of the tree, in the order they are seeded.
export const NODES = ['farms', 'plots', 'climate', 'mills', 'suppliers', 'batches', 'samples'];

const CONSOLE_HELP = [
  'Firebase console > Build > Realtime Database.',
  '  - If there is no database: Create Database > pick a location > Start in TEST MODE > Enable.',
  '  - If it exists: Rules tab > set  { "rules": { ".read": true, ".write": true } }  > Publish (demo only).',
  'This script never deploys rules.',
].join('\n');

// Turn an error into the exact thing the user must do.
export function explain(err) {
  const msg = String(err?.message ?? err);
  if (/PERMISSION_DENIED|Permission denied|\b401\b|\b403\b/i.test(msg)) {
    return 'Realtime Database rules deny this request (permission denied).\n' + CONSOLE_HELP;
  }
  if (/\b404\b|not exist|not found/i.test(msg)) {
    return 'The Realtime Database instance olivewatch-ai-default-rtdb does not exist (404).\n' + CONSOLE_HELP;
  }
  return msg;
}

// Fast, honest connectivity test over REST (no SDK retry loop), 10 second timeout.
// 200 = ok (body "null" = empty), 401 = rules deny, 404 = instance does not exist.
export async function preflight() {
  const url = `${firebaseConfig.databaseURL}/.json?shallow=true`;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 10000);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    const body = await res.text();
    if (!res.ok) throw new Error(`REST ${res.status}: ${body.slice(0, 200)}`);
    return body === 'null' ? 'empty' : 'has data';
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('offline: no response from Realtime Database in 10s');
    throw err;
  } finally {
    clearTimeout(t);
  }
}

// Promise.race against a 10 second timer; callers print the error and process.exit(1).
export function withTimeout(promise, ms = 10000) {
  let timer;
  const timeout = new Promise((_, rej) => {
    timer = setTimeout(() => rej(new Error(`timeout: no response from Realtime Database in ${ms / 1000}s (rules deny writes, or offline)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
