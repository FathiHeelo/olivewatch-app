import { Link } from 'react-router-dom';
import { Empty, Loading, PageHeader, Pill, SourceChip } from '../components/ui';
import { climateStressIndex, stressBand } from '../data/csi';
import { useMillData } from '../data/DataProvider';
import { fmtNum } from '../data/format';

export const bandTone = (band: 'low' | 'medium' | 'high') => (band === 'low' ? 'accent' : band === 'medium' ? 'warning' : 'negative');

export default function Suppliers() {
  const { suppliers, batches, status } = useMillData();
  return (
    <>
      <PageHeader title="الموردون" chip="تجريبية" />
      {status === 'loading' ? (
        <Loading />
      ) : suppliers.length === 0 ? (
        <Empty title="لا يوجد موردون بعد" />
      ) : (
        <div className="table-wrap fade-in">
          <table className="table">
            <thead>
              <tr>
                <th>المورد</th>
                <th>القرية</th>
                <th className="num">دفعات</th>
                <th className="num">زيتون (كغ)</th>
                <th className="num">مؤشر الإجهاد</th>
                <th>الحالة</th>
                <th>المصدر</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => {
                const own = batches.filter((b) => b.supplierId === s.id);
                const csi = climateStressIndex(s.dT, s.dP, s.dryDays);
                const band = stressBand(csi);
                return (
                  <tr key={s.id}>
                    <td className="row-link">{s.name}</td>
                    <td>{s.village}</td>
                    <td className="num">
                      {own.length ? <Link to={`/batches?q=${encodeURIComponent(s.village)}`}>{fmtNum(own.length)}</Link> : fmtNum(0)}
                    </td>
                    <td className="num">{fmtNum(own.reduce((a, b) => a + b.oliveKg, 0))}</td>
                    <td className="num">{csi.toFixed(1)}</td>
                    <td>
                      <Pill tone={bandTone(band.band)}>{band.label}</Pill>
                    </td>
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
      <p className="muted">أسماء الموردين هنا أسماء مزارع بحسب القرية، دون أسماء أشخاص. مؤشر الإجهاد محاكاة محسوبة من مدخلات تجريبية.</p>
    </>
  );
}
