// UV Scan tool for mills. Same flow as Zaytoun Vision's web app (live camera or upload, pipeline checklist, verdict and
// evidence, history, printable report) in OliveWatch colours. The analysis runs on the Zaytoun Vision backend
// (VITE_ZAYTOUN_API_URL); when it cannot answer, the page says so and shows no result.
import { DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMillData } from '../data/DataProvider';
import { useLang } from '../i18n';
import { DEFAULT_MILL_ID, StoredScan, saveUvScan, subscribeUvScans } from '../uv/scans';
import { analyzeUv, blobToDataUrl, flagReason, toScanRecord, type RetakeReason, type UvDecision, type UvError, type UvResult } from '../uv/zaytoun';
import { uvText, type UvText } from '../uv/zaytoun-i18n';

const API = import.meta.env.VITE_ZAYTOUN_API_URL as string | undefined;

// savedId: undefined while saving, null if the database did not confirm, else the new scan id.
type Phase = { k: 'idle' } | { k: 'loading' } | { k: 'error'; error: UvError } | { k: 'done'; result: UvResult; savedId?: string | null };
type PrintTarget = { kind: 'scan'; scan: StoredScan } | { kind: 'table'; scans: StoredScan[] } | null;

const ltr = (s: string) => `⁦${s}⁩`;

export default function UvScan() {
  const { lang } = useLang();
  const t = uvText(lang);
  const { mill, batches } = useMillData();
  const userId = mill?.id ?? DEFAULT_MILL_ID;

  const [image, setImage] = useState<string | null>(null);
  const [sampleId, setSampleId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [phase, setPhase] = useState<Phase>({ k: 'idle' });
  const [guideOpen, setGuideOpen] = useState(false);
  const [scans, setScans] = useState<StoredScan[] | null>(null);
  const [historyFailed, setHistoryFailed] = useState(false);
  const [printTarget, setPrintTarget] = useState<PrintTarget>(null);

  useEffect(() => subscribeUvScans(userId, setScans, () => setHistoryFailed(true)), [userId]);

  // Print after the report block is rendered; clear it afterwards.
  useEffect(() => {
    if (!printTarget) return;
    const done = () => setPrintTarget(null);
    window.addEventListener('afterprint', done, { once: true });
    const id = window.setTimeout(() => window.print(), 50);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('afterprint', done);
    };
  }, [printTarget]);

  async function analyze() {
    if (!image) return;
    setPhase({ k: 'loading' });
    const r = await analyzeUv(API, image, { sampleName: sampleId.trim() || batchId || undefined });
    if (!r.ok) {
      setPhase({ k: 'error', error: r.error });
      return;
    }
    setPhase({ k: 'done', result: r.data });
    const id = await saveUvScan(userId, toScanRecord(r.data, 'platform', { sampleId, batchId }));
    setPhase((p) => (p.k === 'done' && p.result === r.data ? { ...p, savedId: id } : p));
  }

  function reset() {
    setImage(null);
    setPhase({ k: 'idle' });
  }

  const busy = phase.k === 'loading';

  return (
    <div className="uv-page">
      <header className="uv-row">
        <div style={{ display: 'grid', gap: 4 }}>
          <h1>{t.title}</h1>
          <p className="uv-muted">{t.subtitle}</p>
        </div>
        <span className="uv-chip mode">{t.modeUv}</span>
      </header>

      {/* Safety before capture */}
      <section className="uv-card flagged" aria-label={t.safetyTitle}>
        <h3>{t.safetyTitle}</h3>
        <ul className="uv-list">
          {t.safety.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="uv-muted">{t.modeNote}</p>
      </section>

      {/* Sample link */}
      <section className="uv-card">
        <div className="uv-grid2">
          <label className="uv-label">
            {t.sampleIdLabel}
            <input className="uv-input" value={sampleId} onChange={(e) => setSampleId(e.target.value)} placeholder="S-2024-001" />
            <span className="uv-muted" style={{ fontWeight: 400 }}>
              {t.sampleIdHint}
            </span>
          </label>
          <label className="uv-label">
            {t.batchLabel}
            <select className="uv-input" value={batchId} onChange={(e) => setBatchId(e.target.value)}>
              <option value="">{t.noBatch}</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} · {b.village}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Capture: live camera and upload, side by side (Zaytoun "Analyze Sample") */}
      {phase.k !== 'done' ? (
        <section className="uv-grid2">
          <CameraCard t={t} disabled={busy} onCapture={setImage} />
          <UploadCard t={t} disabled={busy} image={image} onImage={setImage} />
        </section>
      ) : null}

      {image && phase.k !== 'done' ? (
        <div className="uv-actions">
          <button type="button" className="uv-btn primary" onClick={analyze} disabled={busy}>
            {t.analyze}
          </button>
          <button type="button" className="uv-btn" onClick={reset} disabled={busy}>
            {t.cancel}
          </button>
        </div>
      ) : null}

      {/* Capture guide */}
      {phase.k !== 'done' ? (
        <section className="uv-card">
          <button type="button" className="uv-btn" onClick={() => setGuideOpen((o) => !o)} aria-expanded={guideOpen} style={{ justifySelf: 'start' }}>
            {t.guideTitle} {guideOpen ? '▲' : '▼'}
          </button>
          {guideOpen ? (
            <>
              <ul className="uv-list">
                {t.guide.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
              <p>{t.redNote}</p>
            </>
          ) : null}
        </section>
      ) : null}

      {/* Pipeline checklist while the server works */}
      {phase.k === 'loading' ? (
        <section className="uv-card" role="status" aria-live="polite">
          <h3>{t.pipelineTitle}</h3>
          <ol className="uv-steps">
            <li>✓ {t.stepPhoto}</li>
            <li className="active">
              <span className="uv-spin" aria-hidden="true" /> {t.stepServer}
            </li>
            <li className="pending">○ {t.stepResult}</li>
          </ol>
        </section>
      ) : null}

      {phase.k === 'error' ? (
        <section className="uv-card retake" role="alert">
          <h2>{t.errorTitle}</h2>
          <p>{t.errors[phase.error]}</p>
          <div className="uv-actions">
            <button type="button" className="uv-btn primary" onClick={analyze}>
              {t.tryAgain}
            </button>
          </div>
        </section>
      ) : null}

      {phase.k === 'done' ? (
        <>
          {image ? (
            <div className="uv-stage">
              <img src={image} alt={t.title} />
            </div>
          ) : null}
          <ResultView t={t} result={phase.result} />
          {phase.savedId !== undefined ? <p className="uv-muted">{phase.savedId ? t.saved : t.saveFailed}</p> : null}
          <div className="uv-actions">
            <button type="button" className="uv-btn primary" onClick={reset}>
              {phase.result.valid ? t.newScan : t.retakePhoto}
            </button>
            {(() => {
              const mine = phase.savedId ? scans?.find((s) => s.id === phase.savedId) : undefined;
              return mine ? (
                <button type="button" className="uv-btn" onClick={() => setPrintTarget({ kind: 'scan', scan: mine })}>
                  {t.print}
                </button>
              ) : null;
            })()}
          </div>
        </>
      ) : null}

      {phase.k !== 'idle' ? <Notice t={t} /> : null}

      <History t={t} lang={lang} scans={scans} failed={historyFailed} onPrintScan={(scan) => setPrintTarget({ kind: 'scan', scan })} onPrintTable={(list) => setPrintTarget({ kind: 'table', scans: list })} />

      <Notice t={t} />
      <p className="uv-muted">
        {t.credit}:{' '}
        <a href={t.creditUrl} target="_blank" rel="noreferrer">
          {t.creditUrl}
        </a>
      </p>

      {printTarget ? <PrintReport t={t} lang={lang} target={printTarget} /> : null}
    </div>
  );
}

function Notice({ t }: { t: UvText }) {
  return (
    <p className="uv-notice" role="note">
      <span aria-hidden="true">ⓘ</span>
      <span>{t.notice}</span>
    </p>
  );
}

function CameraCard({ t, disabled, onCapture }: { t: UvText; disabled: boolean; onCapture: (dataUrl: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => () => stream?.getTracks().forEach((tr) => tr.stop()), [stream]);
  useEffect(() => {
    if (video.current && stream) video.current.srcObject = stream;
  }, [stream]);

  async function start() {
    setError(false);
    try {
      setStream(await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }));
    } catch {
      setError(true);
    }
  }
  function stop() {
    stream?.getTracks().forEach((tr) => tr.stop());
    setStream(null);
  }
  function capture() {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    onCapture(c.toDataURL('image/jpeg', 0.92));
    stop();
  }

  return (
    <div className="uv-card">
      <h3>{t.cameraTitle}</h3>
      <div className="uv-stage">{stream ? <video ref={video} autoPlay playsInline muted /> : <p>{error ? t.cameraError : t.guide[1]}</p>}</div>
      <div className="uv-actions">
        {stream ? (
          <>
            <button type="button" className="uv-btn primary" onClick={capture} disabled={disabled}>
              {t.capture}
            </button>
            <button type="button" className="uv-btn" onClick={stop}>
              {t.stopCamera}
            </button>
          </>
        ) : (
          <button type="button" className="uv-btn highlight" onClick={start} disabled={disabled}>
            {t.startCamera}
          </button>
        )}
      </div>
    </div>
  );
}

function UploadCard({ t, disabled, image, onImage }: { t: UvText; disabled: boolean; image: string | null; onImage: (dataUrl: string) => void }) {
  const [over, setOver] = useState(false);
  const read = async (file?: File | null) => {
    if (file && /^image\/(jpeg|png)$/.test(file.type)) onImage(await blobToDataUrl(file));
  };
  const drop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    read(e.dataTransfer.files?.[0]);
  };
  return (
    <div className={`uv-card uv-drop${over ? ' over' : ''}`} onDragOver={(e) => (e.preventDefault(), setOver(true))} onDragLeave={() => setOver(false)} onDrop={drop}>
      <h3>{t.uploadTitle}</h3>
      <div className="uv-stage">{image ? <img src={image} alt={t.uploadTitle} /> : <p>{t.dropHint}</p>}</div>
      <label className="uv-btn highlight" style={{ justifySelf: 'start' }} aria-disabled={disabled}>
        {t.choosePhoto}
        <input type="file" accept="image/jpeg,image/png" hidden disabled={disabled} onChange={(e) => read(e.target.files?.[0])} data-testid="uv-file" />
      </label>
    </div>
  );
}

function Level({ t, level }: { t: UvText; level: 'low' | 'medium' | 'high' }) {
  const n = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
  return (
    <div className="uv-row">
      <strong>{t.levelLabel}</strong>
      <span className="uv-level">
        {[1, 2, 3].map((i) => (
          <i key={i} className={i <= n ? 'on' : ''} aria-hidden="true" />
        ))}
        {t.levels[level]}
      </span>
    </div>
  );
}

function ResultView({ t, result }: { t: UvText; result: UvResult }) {
  if (!result.valid) {
    return (
      <section className="uv-card retake" role="alert">
        <h2>{t.retakeTitle}</h2>
        <p>{t.retakeBody}</p>
        <ul className="uv-list">
          {result.retake.map((r) => (
            <li key={r}>{t.retake[r]}</li>
          ))}
        </ul>
      </section>
    );
  }
  const ind = result.indicators;
  const reasons = [...new Set(ind.flags.map(flagReason).filter((x): x is RetakeReason => x !== null))];
  const share = (v?: number) => `${Math.round(Math.max(0, Math.min(1, v ?? 0)) * 100)}%`;
  return (
    <div className="uv-grid2">
      <section className="uv-card">
        <p className="uv-muted">{t.resultTitle}</p>
        <span className={`uv-chip ${result.decision}`}>{t.decisions[result.decision].title}</span>
        <h2>{t.decisions[result.decision].title}</h2>
        <p>{t.decisions[result.decision].body}</p>
        <Level t={t} level={result.confidence_level} />
      </section>
      <section className="uv-card">
        <h3>{t.evidenceTitle}</h3>
        {(
          [
            ['red', t.redLabel, t.indicator[ind.red], ind.fractions?.red],
            ['green', t.greenLabel, t.indicator[ind.greenBaseline], ind.fractions?.green],
            ['blue', t.blueLabel, t.indicator[ind.blue], ind.fractions?.blue],
          ] as const
        ).map(([key, label, state, f]) => (
          <div key={key} style={{ display: 'grid', gap: 6 }}>
            <div className="uv-row">
              <strong>{label}</strong>
              <span>{state}</span>
            </div>
            {f !== undefined ? (
              <div className="uv-bar">
                <span className={key} style={{ width: share(f) }} />
              </div>
            ) : null}
          </div>
        ))}
        {ind.redBlueRatio !== null && ind.greenBlueRatio !== null ? (
          <div className="uv-row">
            <span className="uv-muted">{t.ratiosLabel}</span>
            <strong>{ltr(`R/B ${ind.redBlueRatio.toFixed(2)} · G/B ${ind.greenBlueRatio.toFixed(2)}`)}</strong>
          </div>
        ) : null}
        <div className="uv-trace">
          <strong>{t.flagsLabel}</strong>
          {reasons.length ? (
            <ul className="uv-list">
              {reasons.map((r) => (
                <li key={r}>{t.retake[r]}</li>
              ))}
            </ul>
          ) : (
            <p className="uv-muted">{t.noFlags}</p>
          )}
          <p>{t.redNote}</p>
        </div>
      </section>
    </div>
  );
}

function decisionLabel(t: UvText, s: StoredScan) {
  return s.valid && s.decision ? t.decisions[s.decision as UvDecision].title : t.retakeTitle;
}

function History({ t, lang, scans, failed, onPrintScan, onPrintTable }: { t: UvText; lang: 'ar' | 'en'; scans: StoredScan[] | null; failed: boolean; onPrintScan: (s: StoredScan) => void; onPrintTable: (list: StoredScan[]) => void }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | UvDecision | 'retake'>('all');
  const when = (at: number) => new Date(at).toLocaleString(lang === 'ar' ? 'ar' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (scans ?? []).filter((s) => {
      const okFilter = filter === 'all' || (filter === 'retake' ? !s.valid : s.valid && s.decision === filter);
      const okSearch = !needle || (s.sampleId ?? '').toLowerCase().includes(needle) || (s.batchId ?? '').toLowerCase().includes(needle);
      return okFilter && okSearch;
    });
  }, [scans, q, filter]);

  return (
    <section className="uv-card" aria-label={t.historyTitle}>
      <div className="uv-row">
        <h2>{t.historyTitle}</h2>
        <button type="button" className="uv-btn" onClick={() => onPrintTable(shown)} disabled={!shown.length}>
          {t.printTable}
        </button>
      </div>
      <div className="uv-filters">
        <label className="uv-label">
          {t.search}
          <input className="uv-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="uv-label">
          {t.colDecision}
          <select className="uv-input" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">{t.filterAll}</option>
            {(['within_reference', 'aging_flagged', 'oxidation_flagged', 'suspicion_flagged'] as const).map((d) => (
              <option key={d} value={d}>
                {t.decisions[d].title}
              </option>
            ))}
            <option value="retake">{t.filterRetake}</option>
          </select>
        </label>
      </div>
      {failed ? <p>{t.errors.network}</p> : null}
      {scans === null && !failed ? <p className="uv-muted">…</p> : null}
      {scans && !shown.length ? <p className="uv-muted">{t.historyEmpty}</p> : null}
      {shown.length ? (
        <div className="uv-table-wrap">
          <table className="uv-table">
            <thead>
              <tr>
                <th>{t.colDate}</th>
                <th>{t.colSample}</th>
                <th>{t.colBatch}</th>
                <th>{t.colDecision}</th>
                <th>{t.colLevel}</th>
                <th>
                  <span className="uv-sr">{t.print}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id}>
                  <td>{when(s.at)}</td>
                  <td>{s.sampleId ? ltr(s.sampleId) : '—'}</td>
                  <td>{s.batchId ? ltr(s.batchId) : '—'}</td>
                  <td>
                    <span className={`uv-chip ${s.valid && s.decision ? s.decision : 'retake'}`}>{decisionLabel(t, s)}</span>
                  </td>
                  <td>{s.valid && s.confidenceLevel ? t.levels[s.confidenceLevel] : '—'}</td>
                  <td>
                    <button type="button" className="uv-btn" onClick={() => onPrintScan(s)} aria-label={`${t.print} ${s.sampleId ?? ''}`}>
                      {t.print}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function PrintReport({ t, lang, target }: { t: UvText; lang: 'ar' | 'en'; target: NonNullable<PrintTarget> }) {
  const when = (at: number) => new Date(at).toLocaleString(lang === 'ar' ? 'ar' : 'en-GB');
  const list = target.kind === 'scan' ? [target.scan] : target.scans;
  return (
    <div className="uv-print" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1>{t.reportTitle}</h1>
      <p>
        {t.reportGenerated}: {when(Date.now())}
      </p>
      <table>
        <thead>
          <tr>
            <th>{t.colDate}</th>
            <th>{t.colSample}</th>
            <th>{t.colBatch}</th>
            <th>{t.colDecision}</th>
            <th>{t.colLevel}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.id}>
              <td>{when(s.at)}</td>
              <td>{s.sampleId ?? '—'}</td>
              <td>{s.batchId ?? '—'}</td>
              <td>{decisionLabel(t, s)}</td>
              <td>{s.valid && s.confidenceLevel ? t.levels[s.confidenceLevel] : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {target.kind === 'scan' && target.scan.valid && target.scan.decision ? <p>{t.decisions[target.scan.decision].body}</p> : null}
      {target.kind === 'scan' && !target.scan.valid ? <p>{target.scan.retake.map((r) => t.retake[r]).join(' ')}</p> : null}
      <p>{t.redNote}</p>
      <p className="uv-notice">{t.notice}</p>
      <p>
        {t.credit}: {t.creditUrl}
      </p>
    </div>
  );
}
