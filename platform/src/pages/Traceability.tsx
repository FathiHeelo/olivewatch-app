import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ConsumerPreview from '../components/ConsumerPreview';
import { BatchId, Card, Empty, Loading, PageHeader, ScreeningPill, StatusPill, Val } from '../components/ui';
import { useMillData } from '../data/DataProvider';
import { fmtDate } from '../data/format';
import { batchesCsv, byNewest, sampleOf } from '../data/kpis';

// A real CSV file with a UTF-8 BOM so Excel reads the Arabic correctly.
function downloadCsv(csv: string, name: string) {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Traceability() {
  const { batches, samples, suppliers, mill, status } = useMillData();
  const rows = useMemo(() => [...batches].sort(byNewest), [batches]);
  const [picked, setPicked] = useState<string>();
  const selected = rows.find((b) => b.id === picked) ?? rows[0];

  return (
    <>
      <PageHeader
        title="التتبع والتقارير"
        chip="تجريبية"
        actions={
          <button
            type="button"
            className="btn btn-outline press"
            disabled={batches.length === 0}
            onClick={() => downloadCsv(batchesCsv(batches, samples), `olivewatch-season-${mill?.season ?? '2026'}.csv`)}
          >
            تنزيل تقرير الموسم
          </button>
        }
      />

      {status === 'loading' ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty title="لا توجد دفعات بعد" hint="تظهر جوازات الدفعات هنا بعد تسجيل أول دفعة." />
      ) : (
        <div className="trace-grid">
          <div className="table-wrap fade-in">
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الدفعة</th>
                  <th>القرية</th>
                  <th>تاريخ الاستلام</th>
                  <th>الفحص الأولي</th>
                  <th>الحالة</th>
                  <th>
                    <span className="sr-only">المعاينة</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => {
                  const s = sampleOf(b.id, samples);
                  return (
                    <tr key={b.id} className={b.id === selected?.id ? 'selected' : ''}>
                      <td>
                        <Link to={`/batches/${b.id}`} className="row-link">
                          <BatchId id={b.id} />
                        </Link>
                      </td>
                      <td>{b.village}</td>
                      <td>
                        <Val>{fmtDate(b.receivedAt)}</Val>
                      </td>
                      <td>{s ? <ScreeningPill result={s.result} /> : <Val>{undefined}</Val>}</td>
                      <td>
                        <StatusPill status={b.status} />
                      </td>
                      <td>
                        <button type="button" className="btn btn-outline press btn-sm" onClick={() => setPicked(b.id)} aria-pressed={b.id === selected?.id}>
                          معاينة
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selected && (
            <Card title="الصفحة العامة للمستهلك">
              <ConsumerPreview batch={selected} mill={mill} supplier={suppliers.find((s) => s.id === selected.supplierId)} />
            </Card>
          )}
        </div>
      )}
    </>
  );
}
