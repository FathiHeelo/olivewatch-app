// Run with: npm run test:csi   (no test framework; throws on the first failure)
import { climateStressIndex, stressBand } from './csi';

const cases: Array<[number, number, number, number]> = [
  [2, -20, 10, 46.7],
  [4, -40, 30, 100],
  [0, 0, 0, 0],
  [8, -80, 90, 100], // clamped
  [2, 20, 10, 26.7], // surplus rain counts as zero stress, not negative
];
for (const [dT, dP, d, want] of cases) {
  const got = climateStressIndex(dT, dP, d);
  if (got !== want) throw new Error(`CSI(${dT}, ${dP}, ${d}) = ${got}, expected ${want}`);
}
if (stressBand(46.7).label !== 'إجهاد متوسط') throw new Error('band for 46.7 should be medium');
if (stressBand(32.9).band !== 'low' || stressBand(66).band !== 'high') throw new Error('band thresholds');
console.log(`csi: ${cases.length} cases ok (2,-20,10 -> 46.7)`);
