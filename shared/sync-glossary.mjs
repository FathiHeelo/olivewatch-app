// node shared/sync-glossary.mjs           copy shared/glossary.ts into gateway, mobile and platform, and the UV
//                                          screening client (shared/zaytoun.ts, shared/zaytoun-i18n.ts) into mobile and platform
// node shared/sync-glossary.mjs --check   fail if a copy differs, or if an app dictionary spells a glossary term's
//                                          pronunciation differently ("NDVI (xxx)" must use the glossary's xxx)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'shared/glossary.ts'), 'utf8');
const banner = '// GENERATED from shared/glossary.ts by `node shared/sync-glossary.mjs`. Do not edit this copy.\n';
const copies = ['gateway/src/ai/glossary.ts', 'mobile/src/i18n/glossary.ts', 'platform/src/i18n/glossary.ts'];
const expected = banner + source;
const check = process.argv.includes('--check');
let bad = 0;

// [source, its expected copy content, copies]
const groups = [['shared/glossary.ts', expected, copies]];
for (const name of ['zaytoun.ts', 'zaytoun-i18n.ts']) {
  const src = `shared/${name}`;
  const content = `// GENERATED from ${src} by \`node shared/sync-glossary.mjs\`. Do not edit this copy.\n` + readFileSync(join(root, src), 'utf8');
  groups.push([src, content, [`mobile/src/uv/${name}`, `platform/src/uv/${name}`]]);
}

for (const [, content, targets] of groups) {
  for (const rel of targets) {
    const file = join(root, rel);
    const same = existsSync(file) && readFileSync(file, 'utf8') === content;
    if (check) {
      console.log(`${same ? 'ok  ' : 'DIFF'} ${rel}`);
      if (!same) bad++;
    } else {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content);
      console.log(`wrote ${rel}`);
    }
  }
}

if (check) {
  // Pull the glossary object out of the TS source (no TS compiler needed).
  const body = source.slice(source.indexOf('export const GLOSSARY'), source.indexOf('export function glossaryRule'));
  const glossary = Object.fromEntries([...body.matchAll(/(?:'([^']+)'|([A-Za-z0-9]+)):\s*'([^']+)'/g)].map((m) => [(m[1] ?? m[2]).toLowerCase(), m[3]]));
  for (const rel of ['mobile/src/i18n/dictionary.ts', 'platform/src/i18n/dictionary.ts']) {
    const text = readFileSync(join(root, rel), 'utf8');
    let seen = 0;
    for (const m of text.matchAll(/([A-Za-z][A-Za-z0-9\-]*(?: [A-Za-z][A-Za-z0-9\-]*){0,2}) \(([؀-ۿ][؀-ۿ0-9 \-]*)\)/g)) {
      const want = glossary[m[1].trim().toLowerCase()];
      if (want === undefined) continue; // not a glossary term (e.g. an Arabic name in parentheses)
      seen++;
      if (want !== m[2].trim()) {
        console.log(`MISMATCH ${rel}: "${m[1]} (${m[2]})" but the glossary says "${m[1]} (${want})"`);
        bad++;
      }
    }
    console.log(`checked ${rel}: ${seen} annotated glossary terms`);
  }
  console.log(bad ? `${bad} problem(s)` : 'glossary: all copies identical, all dictionary pronunciations consistent');
  process.exit(bad ? 1 : 0);
}
