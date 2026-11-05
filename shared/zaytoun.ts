// Zaytoun Vision UV screening client, shared by the mobile app and the mill dashboard.
// Built on the Zaytoun Vision project: https://github.com/Mutasem-mk4/zaytoun-vision (backend copied to zaytoun-backend/).
//
// The real backend contract (zaytoun-backend/main.py): POST {base}/api/analyze with JSON
// { imageUrl: "data:image/...;base64,...", sampleName }. There is no /predict route and no `mode` field.
// The response is turned into one honest object here; the backend's own verdict text, purityScore and
// fakeProbability are never shown (they claim more than a phone photo can tell).
// No imports on purpose: this file runs in React Native, the browser and Node (tests).

export type UvDecision = 'within_reference' | 'aging_flagged' | 'oxidation_flagged' | 'suspicion_flagged';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type RetakeReason = 'not_dark_room' | 'glare' | 'surface_hotspot' | 'no_liquid' | 'saturated' | 'too_small' | 'unclear';

export type UvIndicators = {
  red: 'detected' | 'weak';
  greenBaseline: 'present' | 'absent';
  blue: 'dominant' | 'not_dominant';
  redBlueRatio: number | null;
  greenBlueRatio: number | null;
  flags: string[];
};

export type UvResult =
  | { valid: true; decision: UvDecision; indicators: UvIndicators; confidence_level: ConfidenceLevel; retake: []; azure?: unknown; raw: unknown }
  | { valid: false; decision: null; indicators: UvIndicators | null; confidence_level: null; retake: RetakeReason[]; azure?: unknown; raw: unknown };

export type UvError = 'not_configured' | 'timeout' | 'network' | 'bad_image' | 'server' | 'bad_response';
export type UvCall = { ok: true; data: UvResult; ms: number } | { ok: false; error: UvError; status: number };

const DECISION: Record<string, UvDecision> = {
  fresh_evoo: 'within_reference',
  real_but_aged: 'aging_flagged',
  expired_olive_oil: 'oxidation_flagged',
  fake_or_refined: 'suspicion_flagged',
};

const FLAG_REASON: Record<string, RetakeReason> = {
  non_dark_room_background: 'not_dark_room',
  blue_edge_glare: 'glare',
  red_surface_hotspot: 'surface_hotspot',
  dark_or_no_liquid_roi: 'no_liquid',
  saturated_glare: 'saturated',
  image_too_small: 'too_small',
  empty_image: 'no_liquid',
  empty_roi: 'no_liquid',
};

const SETUP_REASON: Record<string, RetakeReason> = {
  daylight_or_stock_photo: 'not_dark_room',
  recovered_dark_uv_oil: 'not_dark_room',
  glare_or_reflection: 'glare',
  no_liquid_detected: 'no_liquid',
  blurry_or_saturated: 'saturated',
  wrong_crop: 'unclear',
};

type Raw = {
  category?: unknown;
  confidence?: unknown;
  qualityFlags?: unknown;
  photoSetup?: { validForAnalysis?: unknown; enhancementApplied?: unknown; category?: unknown } | null;
  decisionTrace?: { signals?: { redDetected?: unknown; greenBaselinePresent?: unknown; blueDominant?: unknown } } | null;
  uvFingerprint?: { redBlueRatio?: unknown; greenBlueRatio?: unknown } | null;
  calibration?: { isCalibrated?: unknown } | null;
  azure_custom_vision?: unknown;
  azureCustomVision?: unknown;
};

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Qualitative level only: the backend's confidence is a rule margin, not a calibrated probability. */
export function confidenceLevel(confidence: unknown, isCalibrated: boolean): ConfidenceLevel {
  let c = num(confidence) ?? 0;
  if (c > 1) c /= 100;
  const level: ConfidenceLevel = c >= 0.8 ? 'high' : c >= 0.6 ? 'medium' : 'low';
  // Uncalibrated phone-to-lab mapping (the shipped default) never reads as "high".
  return level === 'high' && !isCalibrated ? 'medium' : level;
}

/** Turns a raw /api/analyze response into the app's object, or null if it is not a Zaytoun response. */
export function normalizeZaytoun(input: unknown): UvResult | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Raw;
  const category = typeof raw.category === 'string' ? raw.category : '';
  if (category !== 'invalid_image' && !(category in DECISION)) return null;

  const flags = Array.isArray(raw.qualityFlags) ? raw.qualityFlags.filter((f): f is string => typeof f === 'string') : [];
  const setup = raw.photoSetup ?? null;
  const setupCategory = typeof setup?.category === 'string' ? setup.category : '';
  const signals = raw.decisionTrace?.signals ?? {};
  const indicators: UvIndicators = {
    red: signals.redDetected === true ? 'detected' : 'weak',
    greenBaseline: signals.greenBaselinePresent === true ? 'present' : 'absent',
    blue: signals.blueDominant === true ? 'dominant' : 'not_dominant',
    redBlueRatio: num(raw.uvFingerprint?.redBlueRatio),
    greenBlueRatio: num(raw.uvFingerprint?.greenBlueRatio),
    flags,
  };
  const azure = raw.azure_custom_vision ?? raw.azureCustomVision;
  const extra = azure === undefined ? {} : { azure };

  // A photo the backend could only analyze after masking out a bright background was not taken in a dark room.
  // The backend still returns a verdict for it (it even does so for a daylight bottle or a leaf), so we treat it as
  // conflicting evidence and ask for a retake instead of showing a result.
  const recovered = setup?.enhancementApplied === true;
  const valid = category !== 'invalid_image' && setup?.validForAnalysis !== false && !recovered;

  if (!valid) {
    const reasons = new Set<RetakeReason>();
    if (recovered) reasons.add('not_dark_room');
    for (const f of flags) if (FLAG_REASON[f]) reasons.add(FLAG_REASON[f]);
    if (SETUP_REASON[setupCategory]) reasons.add(SETUP_REASON[setupCategory]);
    if (reasons.size === 0) reasons.add('unclear');
    return { valid: false, decision: null, indicators: category === 'invalid_image' ? null : indicators, confidence_level: null, retake: [...reasons], raw: input, ...extra };
  }

  return {
    valid: true,
    decision: DECISION[category],
    indicators,
    confidence_level: confidenceLevel(raw.confidence, raw.calibration?.isCalibrated === true),
    retake: [],
    raw: input,
    ...extra,
  };
}

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

/** POST {baseUrl}/api/analyze. Never throws, never invents a result: on any failure it says what failed. */
export async function analyzeUv(
  baseUrl: string | undefined,
  imageDataUrl: string,
  opts: { sampleName?: string; timeoutMs?: number; fetchImpl?: FetchLike } = {},
): Promise<UvCall> {
  const base = baseUrl?.trim().replace(/\/+$/, '');
  if (!base) return { ok: false, error: 'not_configured', status: 0 };
  const doFetch = opts.fetchImpl ?? (fetch as unknown as FetchLike);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), opts.timeoutMs ?? 30_000);
  const t0 = Date.now();
  try {
    const res = await doFetch(`${base}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: imageDataUrl, sampleName: opts.sampleName || 'OliveWatch sample' }),
      signal: ctl.signal,
    });
    if (!res.ok) return { ok: false, error: res.status === 400 || res.status === 413 || res.status === 422 ? 'bad_image' : 'server', status: res.status };
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      return { ok: false, error: 'bad_response', status: res.status };
    }
    const data = normalizeZaytoun(body);
    if (!data) return { ok: false, error: 'bad_response', status: res.status };
    return { ok: true, data, ms: Date.now() - t0 };
  } catch {
    return { ok: false, error: ctl.signal.aborted ? 'timeout' : 'network', status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

/** Reads a Blob (browser File, or a React Native fetch(uri).blob()) as a data URL. */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error ?? new Error('read failed'));
    r.readAsDataURL(blob);
  });
}

/** What is stored in Firebase under uvScans/{userId}/{scanId}. No keys, no raw backend verdict text. */
export type UvScanRecord = {
  at: number;
  mode: 'uv';
  valid: boolean;
  decision: UvDecision | null;
  confidenceLevel: ConfidenceLevel | null;
  indicators: UvIndicators | null;
  retake: RetakeReason[];
  sampleId?: string;
  batchId?: string;
  source: 'zaytoun-vision';
  app: 'mobile' | 'platform';
};

export function toScanRecord(r: UvResult, app: UvScanRecord['app'], link: { sampleId?: string; batchId?: string } = {}): UvScanRecord {
  const rec: UvScanRecord = {
    at: Date.now(),
    mode: 'uv',
    valid: r.valid,
    decision: r.decision,
    confidenceLevel: r.confidence_level,
    indicators: r.indicators,
    retake: r.retake,
    source: 'zaytoun-vision',
    app,
  };
  // Realtime Database rejects `undefined` values, so optional links are added only when set.
  if (link.sampleId?.trim()) rec.sampleId = link.sampleId.trim();
  if (link.batchId?.trim()) rec.batchId = link.batchId.trim();
  return rec;
}
