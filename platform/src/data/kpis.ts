// Everything the overview shows is computed from the batch and sample records; nothing is stored.
import { weekStart } from './format';
import { Batch, Sample, STATUS_LABEL } from './types';

export type Kpis = {
  batchCount: number;
  oliveKg: number;
  oilLitres: number; // only batches that were pressed have oilLitres
  pressedCount: number;
  screened: number; // samples with a result other than "pending"
  needsLab: number;
};

export function computeKpis(batches: Batch[], samples: Sample[]): Kpis {
  const ids = new Set(batches.map((b) => b.id));
  const own = samples.filter((s) => ids.has(s.batchId));
  return {
    batchCount: batches.length,
    oliveKg: batches.reduce((a, b) => a + b.oliveKg, 0),
    oilLitres: batches.reduce((a, b) => a + (b.oilLitres ?? 0), 0),
    pressedCount: batches.filter((b) => b.oilLitres != null).length,
    screened: own.filter((s) => s.result !== 'pending').length,
    needsLab: own.filter((s) => s.result === 'needs_lab').length,
  };
}

export type WeekBar = { week: string; kg: number };

// Olives received per ISO week (Monday start), in date order. Only weeks with deliveries are listed.
export function weeklyOlives(batches: Batch[]): WeekBar[] {
  const m = new Map<string, number>();
  for (const b of batches) {
    const w = weekStart(b.receivedAt);
    m.set(w, (m.get(w) ?? 0) + b.oliveKg);
  }
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([week, kg]) => ({ week, kg }));
}

export const byNewest = (a: Batch, b: Batch) => b.receivedAt.localeCompare(a.receivedAt) || b.id.localeCompare(a.id);

export function sampleOf(batchId: string, samples: Sample[]): Sample | undefined {
  return samples.find((s) => s.batchId === batchId);
}

// One CSV row per batch. A missing value is an empty cell (not 0).
export function batchesCsv(batches: Batch[], samples: Sample[]): string {
  const head = ['رقم الدفعة', 'القرية', 'تاريخ الاستلام', 'تاريخ العصر', 'زيتون كغ', 'زيت لتر', 'الحالة', 'نتيجة الفحص الأولي', 'الثقة', 'المصدر'];
  const resultText = { within_reference: 'ضمن النطاق المرجعي', needs_lab: 'يحتاج تحقق مخبري', pending: 'بانتظار الفحص' } as const;
  const esc = (v: string | number | undefined) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [...batches].sort(byNewest).map((b) => {
    const s = sampleOf(b.id, samples);
    return [b.id, b.village, b.receivedAt, b.pressedAt, b.oliveKg, b.oilLitres, STATUS_LABEL[b.status], s ? resultText[s.result] : undefined, s?.confidence, b.source];
  });
  return [head, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
}
