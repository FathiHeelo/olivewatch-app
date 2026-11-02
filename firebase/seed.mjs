// Idempotent seed. update() with fixed per-node paths replaces each node completely, so running it twice
// changes nothing, and batches added later through the dashboard are left alone.
//   farms/plots/climate            <- mobile/src/data/seed.json   (source of truth for the farm app)
//   mills/suppliers/batches/samples <- firebase/mill-data.json
// Realtime Database drops null, so a missing value is an omitted field (see mill-data.json).
import { readFileSync } from 'node:fs';
import { ref, update } from 'firebase/database';
import { db, explain, preflight, withTimeout } from './config.mjs';

const read = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8'));
const farm = read('../mobile/src/data/seed.json');
const mill = read('./mill-data.json');

const tree = {
  farms: farm.farms,
  plots: farm.plots,
  climate: farm.climate,
  mills: { [mill.mill.id]: (({ id, ...rest }) => rest)(mill.mill) },
  suppliers: mill.suppliers,
  batches: mill.batches,
  samples: mill.samples,
};

const paths = {};
for (const [node, children] of Object.entries(tree)) {
  for (const [id, data] of Object.entries(children)) paths[`${node}/${id}`] = data;
}

try {
  const state = await preflight();
  console.log(`preflight ok (database: ${state})`);
  await withTimeout(update(ref(db), paths));
  for (const [node, children] of Object.entries(tree)) console.log(`seeded ${node}: ${Object.keys(children).length}`);
  console.log(`done: ${Object.keys(paths).length} records written`);
  process.exit(0);
} catch (err) {
  console.error('SEED FAILED\n' + explain(err));
  process.exit(1);
}
