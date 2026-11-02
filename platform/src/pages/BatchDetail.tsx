import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import QrBlock from '../components/QrBlock';
import Timeline from '../components/Timeline';
import { ButtonLink, Card, Empty, Loading, PageHeader, Pill, ScreeningPill, SourceChip, StatusPill, Val, kgText } from '../components/ui';
import { climateStressIndex, stressBand } from '../data/csi';
import { useMillData } from '../data/DataProvider';
import { fmtDate, fmtNum, fmtPct, todayISO } from '../data/format';
import { sampleOf } from '../data/kpis';
import { requestLabCheck } from '../data/repository';
import { CONFIDENCE_FLOOR, Sample, ScreeningResult } from '../data/types';

// Below the confidence floor the screening names no class and asks for a laboratory check.
function effectiveResult(s?: Sample): ScreeningResult {
  if (!s || s.result === 'pending') return 'pending';
  if (s.confidence == null || s.confidence < CONFIDENCE_FLOOR) return 'needs_lab';
  return s.result;
}

export default function BatchDetail() {
  const { id = '' } = useParams();
  const { batches, samples, suppliers, status } = useMillData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') return <Loading />;
  const batch = batches.find((b) => b.id === id);
  if (!batch) return <Empty title="الدفعة غير موجودة" hint="ربما حُذفت أو أن الرقم غير صحيح." action={<ButtonLink to="/batches">العودة إلى الدفعات</ButtonLink>} />;

  const sample = sampleOf(batch.id, samples);
  const supplier = suppliers.find((s) => s.id === batch.supplierId);
  const result = effectiveResult(sample);
  const csi = supplier ? climateStressIndex(supplier.dT, supplier.dP, supplier.dryDays) : undefined;
  const band = csi != null ? stressBand(csi) : undefined;
  const live = status === 'live';

  async function askLab() {
    setBusy(true);
    setError('');
    try {
      await requestLabCheck(batch!.id, todayISO());
    } catch (e) {
      setError(`تعذّر تسجيل الطلب: ${(e as Error).message}`);
    }
    setBusy(false);
  }

  const steps = [
    { label: 'استلام الزيتون', detail: fmtDate(batch.receivedAt), done: true },
    { label: 'العصر', detail: fmtDate(batch.pressedAt), done: !!batch.pressedAt },
    { label: 'أخذ العينة', detail: fmtDate(sample?.sampledAt), done: !!sample?.sampledAt },
    { label: 'نتيجة الفحص', detail: result === 'pending' ? undefined : <ScreeningPill result={result} />, done: result !== 'pending' },
  ];

  return (
    <>
      <p>
        <Link to="/batches" className="muted">
          ‹ الدفعات
        </Link>
      </p>
      <PageHeader
        title={`الدفعة ${'⁦'}${batch.id}${'⁩'}`}
        chip={batch.source}
        actions={
          <>
            <StatusPill status={batch.status} />
            <button type="button" className="btn btn-outline press" onClick={askLab} disabled={!live || busy || !!batch.labRequestedAt}>
              طلب تحقق مخبري
            </button>
          </>
        }
      />
      {batch.labRequestedAt && (
        <p className="muted" role="status">
          سُجّل طلب التحقق المخبري بتاريخ {fmtDate(batch.labRequestedAt)}. هذا تسجيل داخلي ولا يُرسل إلى أي مختبر.
        </p>
      )}
      {!live && <p className="error-text">طلب التحقق غير متاح: قاعدة البيانات غير متصلة.</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="detail-grid">
        <div className="detail-main">
          <Card title="الفحص الأولي للزيت" aside={<SourceChip source={sample?.source ?? 'محاكاة'} />}>
            <dl className="facts">
              <div>
                <dt>التصنيف</dt>
                <dd>{result === 'within_reference' ? 'ضمن النطاق المرجعي' : result === 'needs_lab' ? <span className="warn-text">يحتاج تحقق مخبري</span> : <Val>{undefined}</Val>}</dd>
              </div>
              <div>
                <dt>الثقة</dt>
                <dd data-testid="confidence">
                  <Val>{sample?.confidence != null ? fmtPct(sample.confidence) : undefined}</Val>
                </dd>
              </div>
            </dl>
            {result === 'needs_lab' && <p className="callout">الثقة أقل من حد {fmtPct(CONFIDENCE_FLOOR)}، لذلك لا يُسمّى أي تصنيف. نحتاج فحصاً مخبرياً قبل أي استنتاج.</p>}
            {result === 'pending' && <p className="callout">لم تُفحص العينة بعد.</p>}
            <p className="muted">هذا فحص أولي وليس شهادة جودة.</p>
          </Card>

          <Card title="مسار الدفعة">
            <Timeline steps={steps} />
          </Card>
        </div>

        <div className="detail-side">
          <Card title="الدفعة" aside={<SourceChip source={batch.source} />}>
            <dl className="facts">
              <div>
                <dt>زيتون</dt>
                <dd>{kgText(batch.oliveKg)}</dd>
              </div>
              <div>
                <dt>زيت</dt>
                <dd>
                  <Val>{batch.oilLitres != null ? `${fmtNum(batch.oilLitres)} لتر` : undefined}</Val>
                </dd>
              </div>
            </dl>
          </Card>
          <Card title="المورد" aside={supplier && <SourceChip source={supplier.source} />}>
            {supplier ? (
              <dl className="facts">
                <div>
                  <dt>المزرعة</dt>
                  <dd>{supplier.name}</dd>
                </div>
                <div>
                  <dt>القرية</dt>
                  <dd>{supplier.village}</dd>
                </div>
                <div>
                  <dt>مؤشر الإجهاد المناخي</dt>
                  <dd>
                    {csi?.toFixed(1)} {band && <Pill tone={band.band === 'low' ? 'accent' : band.band === 'medium' ? 'warning' : 'negative'}>{band.label}</Pill>}
                  </dd>
                </div>
              </dl>
            ) : (
              <Val>{undefined}</Val>
            )}
          </Card>
          <Card title="رمز الدفعة">
            <QrBlock batchId={batch.id} />
          </Card>
        </div>
      </div>
    </>
  );
}
