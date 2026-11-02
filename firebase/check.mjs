// Reads every collection and prints document counts.
import { collection, getDocsFromServer } from 'firebase/firestore';
import { COLLECTIONS, db, explain, preflight, withTimeout } from './config.mjs';

try {
  await preflight(); // fails fast with the real reason (404 / 403) instead of reporting an empty cache as 0 docs
  let total = 0;
  for (const col of COLLECTIONS) {
    const snap = await withTimeout(getDocsFromServer(collection(db, col)));
    total += snap.size;
    console.log(`${col.padEnd(10)} ${snap.size}  [${snap.docs.map((d) => d.id).join(', ')}]`);
  }
  console.log(`total      ${total}`);
  process.exit(0);
} catch (err) {
  console.error('CHECK FAILED\n' + explain(err));
  process.exit(1);
}
