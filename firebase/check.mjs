// Reads every top-level node with get(ref(db, path)) and prints record counts.
import { get, ref } from 'firebase/database';
import { NODES, db, explain, preflight, withTimeout } from './config.mjs';

try {
  const state = await preflight();
  console.log(`preflight ok (database: ${state})`);
  let total = 0;
  for (const node of NODES) {
    const snap = await withTimeout(get(ref(db, node)));
    const ids = snap.exists() ? Object.keys(snap.val()) : [];
    total += ids.length;
    console.log(`${node.padEnd(10)} ${ids.length}  [${ids.join(', ')}]`);
  }
  console.log(`total      ${total}`);
  process.exit(0);
} catch (err) {
  console.error('CHECK FAILED\n' + explain(err));
  process.exit(1);
}
