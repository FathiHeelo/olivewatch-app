import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BatchId, Empty, Loading, PageHeader, ScreeningPill, StatusPill, Val } from '../components/ui';
import { useMillData } from '../data/DataProvider';
import { fmtDate, fmtNum, isolate } from '../data/format';
import { byNewest, sampleOf } from '../data/kpis';
import { Batch, BatchStatus } from '../data/types';
import { IconSearch } from '../components/Icons';

type Tab = 'all' | BatchStatus;
const tabs: { key: Tab; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'processing', label: 'قيد المعالجة' },
  { key: 'complete', label: 'مكتملة' },
  { key: 'needs_review', label: 'تحتاج مراجعة' },
];

type Sort = 'newest' | 'oldest' | 'kg';
const sorters: Record<Sort, (a: Batch, b: Batch) => number> = {
  newest: byNewest,
  oldest: (a, b) => byNewest(b, a),
  kg: (a, b) => b.oliveKg - a.oliveKg,
};

export default function Batches() {
  const { batches, samples, status } = useMillData();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>('all');
  const [sort, setSort] = useState<Sort>('newest');
  const q = params.get('q') ?? '';

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return batches
      .filter((b) => tab === 'all' || b.status === tab)
      .filter((b) => !needle || b.id.toLowerCase().includes(needle) || b.village.includes(needle))
      .sort(sorters[sort]);
  }, [batches, tab, q, sort]);

  const countOf = (t: Tab) => (t === 'all' ? batches.length : batches.filter((b) => b.status === t).length);

  return (
    <>
      <PageHeader title="الدفعات" chip="تجريبية" />

      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label} <span className="muted">{isolate(countOf(t.key))}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <label className="search">
          <IconSearch />
          <input
            type="search"
            value={q}
            placeholder="ابحث برقم الدفعة أو القرية"
            aria-label="بحث في الدفعات"
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
          />
        </label>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="الترتيب">
          <option value="newest">الأحدث أولاً</option>
          <option value="oldest">الأقدم أولاً</option>
          <option value="kg">الأكبر وزناً</option>
        </select>
        <span className="count" data-testid="batch-count">
          عدد الدفعات: {isolate(rows.length)}
        </span>
      </div>

      {status === 'loading' ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty title="لا توجد دفعات مطابقة" hint="غيّر التبويب أو عبارة البحث." />
      ) : (
        <div className="table-wrap fade-in">
          <table className="table">
            <thead>
              <tr>
                <th>رقم الدفعة</th>
                <th>القرية</th>
                <th>تاريخ الاستلام</th>
                <th className="num">زيتون (كغ)</th>
                <th className="num">زيت (لتر)</th>
                <th>الفحص الأولي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const s = sampleOf(b.id, samples);
                return (
                  <tr key={b.id}>
                    <td>
                      <Link to={`/batches/${b.id}`} className="row-link">
                        <BatchId id={b.id} />
                      </Link>
                    </td>
                    <td>{b.village}</td>
                    <td>
                      <Val>{fmtDate(b.receivedAt)}</Val>
                    </td>
                    <td className="num">{fmtNum(b.oliveKg)}</td>
                    <td className="num">
                      <Val>{b.oilLitres != null ? fmtNum(b.oilLitres) : undefined}</Val>
                    </td>
                    <td>{s ? <ScreeningPill result={s.result} /> : <Val>{undefined}</Val>}</td>
                    <td>
                      <StatusPill status={b.status} />
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
