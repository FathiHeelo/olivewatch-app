// Idempotent seed: setDoc with fixed ids, so running it twice changes nothing.
//   farms/plots/climate  <- mobile/src/data/seed.json   (source of truth for the farm app)
//   mills/suppliers/batches/samples <- firebase/mill-data.json
import { readFileSync } from 'node:fs';
import { doc, setDoc } from 'firebase/firestore';
import { db, explain, preflight, withTimeout } from './config.mjs';

const read = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8'));
const farm = read('../mobile/src/data/seed.json');
const mill = read('./mill-data.json');

const plan = {
  farms: farm.farms,
  plots: farm.plots,
  climate: farm.climate,
  mills: { [mill.mill.id]: mill.mill },
  suppliers: mill.suppliers,
  batches: mill.batches,
  samples: mill.samples,
};

try {
  await preflight();
  for (const [col, docs] of Object.entries(plan)) {
    for (const [id, data] of Object.entries(docs)) {
      await withTimeout(setDoc(doc(db, col, id), data));
    }
    console.log(`seeded ${col}: ${Object.keys(docs).length} docs`);
  }
  console.log('done');
  process.exit(0);
} catch (err) {
  console.error('SEED FAILED\n' + explain(err));
  process.exit(1);
}
