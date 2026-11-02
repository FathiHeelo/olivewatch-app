import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AddBatchDialog from '../components/AddBatchDialog';
import { BarChart } from '../components/Charts';
import { BatchId, ButtonLink, Card, Empty, Loading, PageHeader, StatusPill, kgText, Val } from '../components/ui';
import { useMillData } from '../data/DataProvider';
import { fmtDate, fmtNum, isolate } from '../data/format';
import { byNewest, computeKpis, weeklyOlives } from '../data/kpis';

export default function Overview() {
  const { batches, samples, status } = useMillData();
  const [adding, setAdding] = useState(false);
  const kpis = useMemo(() => computeKpis(batches, samples), [batches, samples]);
  const weeks = useMemo(
    () =>
      weeklyOlives(batches).map((w) => {
        const [, m, d] = w.week.split('-').map(Number);
        return { label: fmtDate(w.week, false) ?? '', short: isolate(`${d}/${m}`), value: w.kg };
      }),
    [batches],
  );
  const latest = useMemo(() => [...batches].sort(byNewest).slice(0, 4), [batches]);

  return (
    <>
      <PageHeader
        title="نظرة عامة"
        chip="تجريبية"
        actions={
          <button type="button" className="btn btn-primary press" onClick={() => setAdding(true)}>
            تسجيل دفعة جديدة
          </button>
        }
      />
      {adding && <AddBatchDialog onClose={() => setAdding(false)} />}

      {status === 'loading' ? (
        <Loading />
      ) : batches.length === 0 ? (
        <Empty title="لا توجد دفعات بعد" hint="سجّل أول دفعة لتظهر المؤشرات هنا." />
      ) : (
        <div className="overview-grid">
          <aside className="rail">
            <Card title="آخر الدفعات">
              <ul className="rail-list">
                {latest.map((b) => (
                  <li key={b.id}>
                    <Link to={`/batches/${b.id}`} className="rail-row press">
                      <span className="rail-main">
                        <strong>
                          <BatchId id={b.id} />
                        </strong>
                        <span className="muted">
                          {b.village} · <Val>{kgText(b.oliveKg)}</Val>
                        </span>
                      </span>
                      <StatusPill status={b.status} />
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonLink to="/batches">عرض الكل</ButtonLink>
            </Card>
          </aside>

          <div className="overview-main">
            <div className="kpis" aria-label="مؤشرات الموسم">
              <div className="kpi">
                <span className="kpi-label">الدفعات</span>
                <span className="kpi-value" data-testid="kpi-batches">
                  {fmtNum(kpis.batchCount)}
                </span>
                <span className="kpi-note">هذا الموسم</span>
              </div>
              <div className="kpi">
                <span className="kpi-label">الزيتون المستلم</span>
                <span className="kpi-value" data-testid="kpi-olives">
                  {fmtNum(kpis.oliveKg)} <span className="kpi-unit">كغ</span>
                </span>
                <span className="kpi-note">مجموع الدفعات</span>
              </div>
              <div className="kpi">
                <span className="kpi-label">الزيت المنتج</span>
                <span className="kpi-value" data-testid="kpi-oil">
                  {fmtNum(kpis.oilLitres)} <span className="kpi-unit">لتر</span>
                </span>
                <span className="kpi-note">دفعات معصورة: {isolate(kpis.pressedCount)}</span>
              </div>
              <div className="kpi">
                <span className="kpi-label">العينات المفحوصة</span>
                <span className="kpi-value" data-testid="kpi-screened">
                  {isolate(kpis.screened)} من {isolate(kpis.batchCount)}
                </span>
                <span className={`kpi-note${kpis.needsLab ? ' warn' : ''}`} data-testid="kpi-needs-lab">
                  {kpis.needsLab ? `${isolate(kpis.needsLab)} تحتاج تحقق مخبري` : 'لا شيء يحتاج تحقق'}
                </span>
              </div>
            </div>

            <Card title="الزيتون المستلم أسبوعياً (كغ)">
              <BarChart data={weeks} label="عمود لكل أسبوع يبيّن كمية الزيتون المستلمة بالكيلوغرام" />
              <p className="muted chart-note">التاريخ تحت كل عمود هو بداية الأسبوع (يوم الاثنين). محسوب من سجلات الدفعات.</p>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
