// Runs mobile/src/data/ml.ts (predictLeaf) in Node against the gateway at EXPO_PUBLIC_AI_URL.
//   live:  EXPO_PUBLIC_AI_URL=http://localhost:8787 npx tsx scripts/verify-mobile-ml.ts
//   down:  EXPO_PUBLIC_AI_URL=http://localhost:1    npx tsx scripts/verify-mobile-ml.ts   (must fall back to the mock)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Test harness only: Node has no FileReader (the phone and the browser do). Same behaviour as readAsDataURL.
class NodeFileReader {
  result: string | null = null;
  error: Error | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readAsDataURL(blob: Blob) {
    blob.arrayBuffer().then(
      (buf) => {
        this.result = `data:${blob.type};base64,${Buffer.from(buf).toString('base64')}`;
        this.onload?.();
      },
      (e) => {
        this.error = e;
        this.onerror?.();
      },
    );
  }
}
(globalThis as unknown as { FileReader: unknown }).FileReader = NodeFileReader;

const here = dirname(fileURLToPath(import.meta.url));
const { predictLeaf } = await import('../../mobile/src/data/ml.ts');
const uri = (f: string, mime: string) => `data:${mime};base64,${readFileSync(join(here, 'fixtures', f)).toString('base64')}`;
const expectLive = !/localhost:1\b/.test(process.env.EXPO_PUBLIC_AI_URL ?? '');

let failed = 0;
const check = (ok: boolean, what: string) => {
  if (!ok) failed++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${what}`);
};

const leaf = await predictLeaf(uri('leaf-spots.jpg', 'image/jpeg'));
console.log('predictLeaf(leaf with spots)  ->', JSON.stringify(leaf));
const leafNo = await predictLeaf(uri('uv-synthetic.png', 'image/png'));
console.log('predictLeaf(not a leaf)       ->', JSON.stringify(leafNo));
// UV oil screening is tested in shared/zaytoun.test.ts (npm run test:uv): it no longer goes through this gateway.

if (expectLive) {
  check(leaf.source === 'gemini' && leaf.kind === 'ok', 'leaf: contract kept, source = gemini');
  check(leafNo.source === 'gemini' && leafNo.kind === 'rejected', 'not a leaf => rejected (retake), same contract');
} else {
  check(leaf.source === 'محاكاة' && leafNo.source === 'محاكاة', 'gateway down => the mock answers, labelled محاكاة');
}
console.log(failed ? `${failed} check(s) FAILED` : 'ok');
process.exit(failed ? 1 : 0);
