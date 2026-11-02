import { mdiArrowTopRight, mdiChevronLeft, mdiChevronRight, mdiLeaf, mdiThermometer, mdiUpdate, mdiWaterOutline, mdiWeatherPouring, mdiWeatherWindy, mdiWhiteBalanceSunny } from '@mdi/js';
import Mdi from '../../components/Mdi';
import { Farm } from '../../data/farm';
import { useLang } from '../../i18n';
import { useOverlays } from '../../components/overlays/OverlayProvider';

function Ring({ value, label }: { value: number; label: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="fw-ring" role="img" aria-label={`${value}%`}>
      <svg viewBox="0 0 80 80" width="92" height="92">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--secondary)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} transform="rotate(-90 40 40)" />
      </svg>
      <strong>{value}%</strong>
      <small>{label}</small>
    </div>
  );
}

export default function Hero({ farm }: { farm: Farm }) {
  const { t, pick, rtl } = useLang();
  const { open, toast } = useOverlays();
  const Chevron = rtl ? mdiChevronLeft : mdiChevronRight;
  const hectares = (farm.areaDunum / 10).toFixed(1);

  const tiles = [
    { icon: mdiThermometer, label: 'Temperature', value: '24', unit: '°C', note: 'Dew point: 16°C' },
    { icon: mdiWaterOutline, label: 'Canopy Humidity', value: '62', unit: '%', note: 'Night peak: 86%', warn: true },
    { icon: mdiWeatherWindy, label: 'Wind Velocity', value: '11', unit: 'km/h', note: 'Direction: WNW' },
    { icon: mdiWeatherPouring, label: 'Rainfall Today', value: '0.0', unit: 'mm', note: 'Rain expected in 5d' },
  ];

  return (
    <>
      <section className="fw-pledge">
        <span className="fw-pledge-icon">
          <Mdi path={mdiLeaf} size={28} />
        </span>
        <div className="fw-pledge-text">
          <span className="fw-tag-line">
            <em>{t('Palestinian Authenticity Charter')}</em>
            <small>{t('Terrace Guardianship')}</small>
          </span>
          <h1>{t('"Every Tree Matters. Every Harvest Counts. Every Drop Has Value."')}</h1>
          <p>{t('Every Tree Matters. Every Harvest Counts. Every Drop Has Value. — Beita Cooperative #PAL-48')}</p>
        </div>
        <div className="fw-pledge-box">
          <small>{t('Pressing Season 2024')}</small>
          <strong>{t('100% Souri EVOO')}</strong>
        </div>
      </section>

      <div className="fw-hero-grid">
        <section className="fw-card fw-grove">
          <div className="fw-grove-head">
            <Ring value={farm.health ?? 94} label={t('Optimal')} />
            <div className="fw-grove-title">
              <span className="fw-chips">
                <em className="fw-chip lime">{t('Jenin – Plot 4B • Beita Terraces')}</em>
                <em className="fw-chip gray">{t('Inherited holding')}</em>
              </span>
              <h2>{pick(farm.name, farm.nameEn ?? farm.name)}</h2>
              <p className="muted">{t('Mount Sabih slopes, Beita • Nablus Southern Foothills • Plot code: PAL-NAB-420B')}</p>
            </div>
          </div>
          <div className="fw-stats">
            <div>
              <small>{t('Total Area')}</small>
              <strong>
                {farm.areaDunum} {t('Dunums')}
              </strong>
              <span>
                {hectares} {t('Hectares')}
              </span>
            </div>
            <div>
              <small>{t('Olive Cultivar')}</small>
              <strong>
                {farm.trees} {t('Trees')}
              </strong>
              <span>{t('Ancient Souri olives')}</span>
            </div>
            <div>
              <small>{t('Est. Cold Press Yield')}</small>
              <strong>3,850 {t('Kg')}</strong>
              <span>{t('Polyphenol > 480 mg/kg')}</span>
            </div>
          </div>
          <div className="fw-grove-foot">
            <button type="button" className="fw-btn dark press" onClick={() => open('farm')}>
              <Mdi path={Chevron} size={18} />
              <span>{t('Farm Details & Dunums')}</span>
            </button>
            <span className="fw-note">
              <Mdi path={mdiUpdate} size={16} />
              {t('NDVI Multispectral pass: 4 hours ago via Sentinel-2')}
            </span>
          </div>
        </section>

        <section className="fw-card fw-weather">
          <header className="fw-card-head">
            <span className="fw-ico amber">
              <Mdi path={mdiWhiteBalanceSunny} size={22} />
            </span>
            <div>
              <small className="fw-eyebrow">{t('Beita Automated Agrometeorology')}</small>
              <h2>{t('Field Agricultural Weather')}</h2>
            </div>
          </header>
          <div className="fw-weather-grid">
            {tiles.map((w) => (
              <div key={w.label} className="fw-tile">
                <span className="fw-tile-ico">
                  <Mdi path={w.icon} size={20} />
                </span>
                <small>{t(w.label)}</small>
                <strong>
                  {w.value}
                  <i>{w.unit === '°C' || w.unit === '%' ? w.unit : t(w.unit)}</i>
                </strong>
                <span className={w.warn ? 'warn' : ''}>{t(w.note)}</span>
              </div>
            ))}
          </div>
          <footer className="fw-weather-foot">
            <span>{t('Stable inversion layer over Nablus basin')}</span>
            <button type="button" className="fw-link as-btn" onClick={() => toast(pick('جارٍ تحميل نموذج ECMWF (إي سي إم دبليو إف) الزراعي عالي الدقة لبيتا', 'Loading ECMWF High-Res Agromodel for Beita'))}>
              <Mdi path={mdiArrowTopRight} size={16} />
              {t('Full Weather Matrix')}
            </button>
          </footer>
        </section>
      </div>
    </>
  );
}
