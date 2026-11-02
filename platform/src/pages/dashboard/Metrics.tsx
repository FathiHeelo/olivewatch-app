import { mdiArrowUp, mdiBarrel, mdiBrain, mdiBug, mdiCloudOutline, mdiForest, mdiLeafCircleOutline, mdiRadar, mdiSpeedometer, mdiWaves } from '@mdi/js';
import Mdi from '../../components/Mdi';
import { useLang } from '../../i18n';
import { useOverlays } from '../../components/overlays/OverlayProvider';

type Metric = { key: string; eyebrow: string; title: string; sub: string; icon: string; tone: string; value: string; unit?: string; chip?: string; chipTone?: string; bar: number; barColor: string; note: string; extra?: string };

const metrics: Metric[] = [
  { key: 'ndvi', eyebrow: 'Foliage Density', title: 'NDVI Canopy Health', sub: 'Biomass and foliage index', icon: mdiLeafCircleOutline, tone: 'lime', value: '0.78', chip: '+4% vs last scan', chipTone: 'up', bar: 78, barColor: 'var(--accent)', note: 'Healthy Souri canopy vigor across 89% of grove' },
  { key: 'soil', eyebrow: 'Subsurface Hydration', title: 'Soil Moisture (30-60cm)', sub: 'Root-zone soil moisture', icon: mdiWaves, tone: 'mint', value: '28', unit: '%', chip: 'Optimal (root zone)', chipTone: 'lime', bar: 60, barColor: 'var(--accent-ink)', note: 'Rainfed limestone soil retainment is satisfactory' },
  { key: 'fly', eyebrow: 'Bio-Pest Sentinel', title: 'Fruit Fly Risk', sub: 'Olive fruit fly risk', icon: mdiBug, tone: 'lime', value: '1.2', unit: 'traps/wk', chip: 'Low', chipTone: 'lime', bar: 28, barColor: '#a9d168', note: 'Below economic damage threshold (Eco-traps primed)' },
  { key: 'press', eyebrow: 'Harvest Index', title: 'Cold Press Readiness', sub: 'Optimal pressing readiness', icon: mdiBarrel, tone: 'amber', value: '18', unit: 'Days', chip: 'Maturity 3.4', chipTone: 'amber', bar: 80, barColor: 'var(--gold)', note: 'Projected optimal polyphenol & oleic acid synthesis' },
  { key: 'rain', eyebrow: 'Cumulative Hydrology', title: 'Seasonal Rainfall', sub: 'Cumulative rainfall', icon: mdiCloudOutline, tone: 'gray', value: '12', unit: 'mm', chip: '-12% deficit', chipTone: 'red', bar: 48, barColor: 'var(--faint)', note: 'Season total: 420mm vs historic 475mm average' },
  { key: 'trees', eyebrow: 'Census Telemetry', title: 'Tree Health Breakdown', sub: 'Individual tree condition', icon: mdiForest, tone: 'lime', value: '595', chip: 'Healthy (96%)', chipTone: 'lime', bar: 96, barColor: 'var(--accent)', note: 'Geo-tagged Souri ancient trees online 620 / 620', extra: '25' },
];

export default function Metrics() {
  const { t } = useLang();
  const { open } = useOverlays();
  return (
    <section id="metrics" className="fw-section">
      <header className="fw-section-head">
        <h2>
          <Mdi path={mdiSpeedometer} size={22} /> {t('Field Intelligence Metrics')}
        </h2>
        <small className="muted">{t('Updated: 18 minutes ago • Sensors 8/8 Online')}</small>
      </header>

      <div className="fw-alert">
        <span className="fw-alert-ico">
          <Mdi path={mdiRadar} size={28} />
        </span>
        <div className="fw-alert-body">
          <span className="fw-chips">
            <em className="fw-chip red">{t('AI THREAT ALERT')}</em>
            <em className="fw-chip gray">{t('Risk Level: Moderate')}</em>
          </span>
          <em className="fw-chip outline">{t('Zone: North Terraces (Plot 4B)')}</em>
          <h2>{t('Olive Peacock Spot risk elevated in North Plot')}</h2>
          <p>{t('Persistent morning dew combined with canopy microclimate humidity (86% between 04:00 and 08:30) triggered the neural spore-germination model.')}</p>
          <p>
            <b>{t('Advisory: Apply bio-copper or organic Bordeaux mixture before Friday rain front.')}</b>
          </p>
        </div>
        <button type="button" className="fw-btn dark press" onClick={() => open('agronomist')}>
          <Mdi path={mdiBrain} size={18} />
          {t('View AI Advisory & Protocol')}
        </button>
      </div>

      <div className="fw-metric-grid">
        {metrics.map((m) => (
          <article key={m.key} className="fw-card fw-metric">
            <header>
              <span className={`fw-ico ${m.tone}`}>
                <Mdi path={m.icon} size={22} />
              </span>
              <div>
                <small className="fw-eyebrow">{t(m.eyebrow)}</small>
                <h3>{t(m.title)}</h3>
                <span className="muted">{t(m.sub)}</span>
              </div>
            </header>
            <div className="fw-metric-value">
              <strong>
                {m.value}
                {m.unit ? <i>{m.unit === '%' ? '%' : t(m.unit)}</i> : null}
              </strong>
              {m.extra ? <b className="fw-red-num">{m.extra}</b> : null}
              {m.chip ? (
                <em className={`fw-chip ${m.chipTone ?? 'gray'}`}>
                  {m.chipTone === 'up' ? <Mdi path={mdiArrowUp} size={12} /> : null}
                  {t(m.chip)}
                </em>
              ) : null}
            </div>
            <div className="fw-bar">
              <span style={{ width: `${m.bar}%`, background: m.barColor }} />
            </div>
            <p className="muted">{t(m.note)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
