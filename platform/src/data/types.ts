// Record shapes in Firebase Realtime Database. The database drops null, so every optional field is simply
// absent when there is no value; the UI shows a grey dash for it.

export type Source = 'حقيقية' | 'تجريبية' | 'محاكاة';

export type BatchStatus = 'complete' | 'processing' | 'needs_review';
export type ScreeningResult = 'within_reference' | 'needs_lab' | 'pending';

export type Mill = {
  id: string;
  name: string;
  city: string;
  season: string;
  source: Source;
};

export type Supplier = {
  id: string;
  name: string;
  village: string;
  lat: number;
  lng: number;
  dT: number;
  dP: number;
  dryDays: number;
  source: Source;
};

export type Batch = {
  id: string;
  millId: string;
  supplierId: string;
  village: string;
  receivedAt: string; // YYYY-MM-DD
  pressedAt?: string;
  oliveKg: number;
  oilLitres?: number;
  status: BatchStatus;
  labRequestedAt?: string;
  source: Source;
};

export type Sample = {
  id: string;
  batchId: string;
  sampledAt?: string;
  result: ScreeningResult;
  confidence?: number; // 0..1
  source: Source;
};

// Below this confidence the screening names no class and asks for a laboratory check.
export const CONFIDENCE_FLOOR = 0.6;

export type MillData = {
  mill: Mill | null;
  suppliers: Supplier[];
  batches: Batch[];
  samples: Sample[];
};

// 'loading' until the first answer, 'live' once the database answered, 'fallback' when it did not
// answer in time (the bundled sample data is then shown with a warning).
export type DataStatus = 'loading' | 'live' | 'fallback';

export const STATUS_LABEL: Record<BatchStatus, string> = {
  complete: 'مكتملة',
  processing: 'قيد المعالجة',
  needs_review: 'تحتاج مراجعة',
};
