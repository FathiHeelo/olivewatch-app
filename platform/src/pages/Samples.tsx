import { Link } from 'react-router-dom';
import { BatchId, Empty, Loading, PageHeader, Pill, ScreeningPill, SourceChip, Val } from '../components/ui';
import { useMillData } from '../data/DataProvider';
import { fmtDate, fmtPct } from '../data/format';
import { CONFIDENCE_FLOOR } from '../data/types';

export default function Samples() {
  const { samples, batches, status } = useMillData();
  const rows = [...samples].sort((a, b) => b.batchId.localeCompare(a.batchId));

  return (
    <>
      <PageHeader title="فحص العينات" chip="محاكاة" />
      <p className="muted">
        الفحص أولي وليس شهادة جودة. عند ثقة أقل من {fmtPct(CONFIDENCE_FLOOR)} لا يُسمّى أي تصنيف ويُطلب تحقق مخبري.
      </p>
      {status === 'loading' ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty title="لا توجد عينات بعد" />
      ) : (
        <div className="table-wrap fade-in">
          <table className="table">
            <thead>
              <tr>
                <th>الدفعة</th>
                <th>القرية</th>
                <th>تاريخ العينة</th>
                <th className="num">الثقة</th>
                <th>النتيجة</th>
                <th>المصدر</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const batch = batches.find((b) => b.id === s.batchId);
                const low = s.result !== 'pending' && (s.confidence == null || s.confidence < CONFIDENCE_FLOOR);
                return (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/batches/${s.batchId}`} className="row-link">
                        <BatchId id={s.batchId} />
                      </Link>
                    </td>
                    <td>
                      <Val>{batch?.village}</Val>
                    </td>
                    <td>
                      <Val>{fmtDate(s.sampledAt)}</Val>
                    </td>
                    <td className="num">
                      <Val>{s.confidence != null ? fmtPct(s.confidence) : undefined}</Val>
                    </td>
                    <td>{low ? <Pill tone="warning">يحتاج تحقق مخبري</Pill> : <ScreeningPill result={s.result} />}</td>
                    <td>
                      <SourceChip source={s.source} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
