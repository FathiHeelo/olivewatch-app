import { useMemo } from 'react';
import { LineChart } from '../components/Charts';
import MapView, { MapPoint } from '../components/MapView';
import { Card, Empty, Loading, PageHeader, Pill, SourceChip } from '../components/ui';
import { climateStressIndex, stressBand } from '../data/csi';
import { useMillData } from '../data/DataProvider';
import { fmtDate, isolate } from '../data/format';
import { ndviSeries } from '../data/repository';
import { bandTone } from './Suppliers';

const bandColor = { low: '#4D6B1F', medium: '#92400E', high: '#B42318' } as const;

export default function Climate() {
  const { suppliers, status } = useMillData();

  const ranked = useMemo(
    () =>
      suppliers
        .map((s) => {
          const csi = climateStressIndex(s.dT, s.dP, s.dryDays);
          return { s, csi, band: stressBand(csi) };
        })
        .sort((a, b) => b.csi - a.csi),
    [suppliers],
  );
  const points = useMemo<MapPoint[]>(() => ranked.map(({ s, csi, band }) => ({ id: s.id, name: s.village, lat: s.lat, lng: s.lng, color: bandColor[band.band], csi })), [ranked]);
  const ndvi = ndviSeries.map((p) => ({ label: fmtDate(p.date, false)?.replace(/^\S+\s/, '') ?? '', value: p.value }));

  return (
    <>
      <PageHeader title="المناخ والأقمار الصناعية" chip="محاكاة" />
      <p className="muted">
        المصادر: <bdi dir="ltr">NASA POWER</bdi> · <bdi dir="ltr">Sentinel-2</bdi>. القيم المعروضة هنا محاكاة للعرض التجريبي ولم تُجلب من هذه المصادر بعد.
      </p>

      {status === 'loading' ? (
        <Loading />
      ) : ranked.length === 0 ? (
        <Empty title="لا يوجد موردون بعد" />
      ) : (
        <>
          <div className="climate-grid">
            <Card title="ترتيب القرى بمؤشر الإجهاد المناخي" aside={<SourceChip source="محاكاة" />}>
              <ol className="ranked">
                {ranked.map(({ s, csi, band }, i) => (
                  <li key={s.id}>
                    <span className="rank-n">{isolate(i + 1)}</span>
                    <span className="rank-name">{s.village}</span>
                    <span className="rank-csi">{csi.toFixed(1)}</span>
                    <Pill tone={bandTone(band.band)}>{band.label}</Pill>
                  </li>
                ))}
              </ol>
              <p className="muted chart-note">CSI = 100 × (0.4·min(ΔT/4, 1) + 0.4·min(−ΔP/40, 1) + 0.2·min(d/30, 1)). يُحسب في الشيفرة عند كل عرض.</p>
            </Card>
            <Card title="مواقع القرى حول نابلس">
              <MapView points={points} />
            </Card>
          </div>

          <Card title="مؤشر NDVI خلال الموسم" aside={<SourceChip source="محاكاة" />}>
            <LineChart data={ndvi} domain={[0.3, 0.5]} label="خط يبيّن تغير مؤشر NDVI المحاكى خلال موسم 2026" />
            <p className="muted chart-note">مؤشر NDVI يحتاج تفسيراً ولا يشخّص الأمراض بمفرده</p>
          </Card>
        </>
      )}
    </>
  );
}
