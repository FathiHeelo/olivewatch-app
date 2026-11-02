// Climate Stress Index (CSI):
//   CSI = 100 * (0.4*min(dT/4,1) + 0.4*min(-dP/40,1) + 0.2*min(d/30,1))
// dT = temperature rise (°C), dP = rainfall anomaly (mm, negative = deficit), d = consecutive dry days.
// Each term is clamped to [0,1]. Worked example: (2, -20, 10) -> 46.7. Always recomputed, never stored.

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function climateStressIndex(dT: number, dP: number, dryDays: number): number {
  const v = 100 * (0.4 * clamp01(dT / 4) + 0.4 * clamp01(-dP / 40) + 0.2 * clamp01(dryDays / 30));
  return Math.round(v * 10) / 10;
}

export type StressBand = 'low' | 'medium' | 'high';

// Band thresholds are an assumption of this demo (same as the mobile app).
export function stressBand(csi: number): { band: StressBand; label: string } {
  if (csi < 33) return { band: 'low', label: 'إجهاد منخفض' };
  if (csi < 66) return { band: 'medium', label: 'إجهاد متوسط' };
  return { band: 'high', label: 'إجهاد مرتفع' };
}
