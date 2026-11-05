import { mdiAlertOutline, mdiClipboardCheckOutline, mdiHistory, mdiLayersOutline, mdiLightbulbOnOutline, mdiMapOutline, mdiSatelliteVariant } from '@mdi/js';
import { Link } from 'react-router-dom';
import Mdi from '../../components/Mdi';
import { sourceChip } from '../../data/aiClient';
import { useHome } from '../../data/farm';
import { useInsights } from '../../data/useInsights';
import { useLang } from '../../i18n';
import { useOverlays } from '../../components/overlays/OverlayProvider';

const log = [
  { date: 'Oct 24 • Today', time: '08:45 AM', title: 'Peacock Spot detected in Tree #142', text: 'Neural leaf scan flagged 86% foliar spore density. Agronomist protocol issued.', tone: 'red' },
  { date: 'Oct 23 • Yesterday', time: '04:12 PM', title: 'Nitrogen-sealed batch #PAL-NAB-2024-098 certified', text: '450 Liters of Extra Virgin Souri olive oil issued digital origin stamp.', tone: 'olive' },
  { date: 'Oct 21', time: '11:30 AM', title: 'UV screening: within the reference pattern (preliminary)', text: 'Laboratory verification recommended before any quality claim.', tone: 'brown' },
  { date: 'Oct 19', time: '02:15 PM', title: 'Cold press milling completed at Al-Asalah Mill', text: 'Two-phase centrifugal extraction kept under 26.4°C temperature ceiling.', tone: 'dark' },
];

const zones = [
  { name: 'Plot 4B (North)', trees: '145 Trees (Alert)', ndvi: '0.58', alert: true },
  { name: 'Central Basin', trees: '280 Mixed Terraces', ndvi: '0.74' },
  { name: 'Terrace 1-12', trees: '195 Ancient Souri', ndvi: '0.82' },
];

export default function Activity() {
  const { t, pick, lang } = useLang();
  const { home } = useHome();
  const ai = useInsights(home, lang);
  const { open, toast } = useOverlays();
  return (
    <>
      <div className="fw-activity-grid">
        <section className="fw-card fw-log">
          <header className="fw-card-head">
            <span className="fw-ico gray">
              <Mdi path={mdiHistory} size={22} />
            </span>
            <div>
              <small className="fw-eyebrow">{t('Audit Log & Milestones')}</small>
              <h2>{t('Recent Orchard Activity')}</h2>
            </div>
          </header>
          <ol className="fw-timeline">
            {log.map((e) => (
              <li key={e.title}>
                <i className={`fw-tl-dot ${e.tone}`} />
                <div>
                  <small className={e.tone === 'red' ? 'red' : ''}>
                    {t(e.date)} · {t(e.time)}
                  </small>
                  <strong>{t(e.title)}</strong>
                  <p className="muted">{t(e.text)}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link to="/batches" className="fw-link">
            <Mdi path={mdiAlertOutline} size={16} />
            {t('View Complete Harvest Audit Ledger')}
          </Link>
        </section>

        <section className="fw-card fw-sat">
          <header className="fw-card-head between">
            <div>
              <small className="fw-eyebrow">{t('Multispectral Geospatial GIS')}</small>
              <h2>{t('Live Satellite View • Sentinel-2 High-Res Grove View')}</h2>
            </div>
            <em className="fw-chip gray">
              <Mdi path={mdiLayersOutline} size={14} /> {t('Layer: NDVI 10m')}
            </em>
          </header>
          <div className="fw-sat-view">
            <div className="fw-coord">
              <small>{t('Coordinates')}</small>
              <b>{t('32.1458° N, 35.2891° E')}</b>
            </div>
            <div className="fw-zone-tags">
              <span className="red">{t('Zone C: 0.58 Stress Alert')}</span>
              <span className="white">{t('Zone B: 0.74 Optimal')}</span>
              <span className="olive">{t('Zone A: 0.82 High Vigor')}</span>
            </div>
            <div className="fw-zones">
              {zones.map((z) => (
                <div key={z.name} className={`fw-zone${z.alert ? ' alert' : ''}`}>
                  <b>{t(z.name)}</b>
                  <small>{t(z.trees)}</small>
                  <strong>{t('NDVI')} {z.ndvi}</strong>
                </div>
              ))}
            </div>
            <div className="fw-sat-meta">
              <span>
                <Mdi path={mdiSatelliteVariant} size={14} /> {t('European Space Agency Copernicus Sentinels')}
              </span>
              <span>{t('Flight pass date: Oct 24, 2024 • 10:14 UTC')}</span>
            </div>
          </div>
          <footer className="fw-sat-foot">
            <Link to="/analytics" className="fw-btn dark press" onClick={() => toast(pick('جارٍ فتح عارض الخرائط الجغرافي بملء الشاشة', 'Opening full-screen GIS parcel viewer'))}>
              <Mdi path={mdiMapOutline} size={18} />
              {t('Explore Satellite Map')}
            </Link>
            <span className="muted">{t('Resolution calibrated for 42 Dunum boundary in Beita, Nablus')}</span>
          </footer>
        </section>
      </div>

      <section className="fw-action">
        <span className="fw-ico lime big">
          <Mdi path={mdiLightbulbOnOutline} size={26} />
        </span>
        <div className="fw-action-body">
          <span className="fw-chips">
            <em className="fw-chip solid">{t('Recommended Immediate Action')}</em>
            <small className="muted">{t("Today's recommended agricultural action")}</small>
          </span>
          <h2>{ai ? ai.title : t('Inspect northern terrace grove for early foliar ring lesions')}</h2>
          <p className="muted">{ai ? `${ai.reason} ${ai.action}` : t('Microclimate sensor B flagged 86% humidity with prolonged morning dew. Early physical inspection of 20 sample trees prevents broad Peacock Spot propagation before the coming rainfront.')}</p>
          {ai ? <em className="fw-chip gray">{sourceChip('gemini', lang)} · {ai.priority}</em> : null}
        </div>
        <div className="fw-action-btns">
          <button type="button" className="fw-btn outline press" onClick={() => open('agronomist')}>
            {t('Chat with Agronomist')}
          </button>
          <button type="button" className="fw-btn dark press" onClick={() => toast(pick('تم تحميل قائمة الفحص للقطعة 4ب (20 شجرة مُعلَّمة)', 'Checklist loaded for Plot 4B (20 trees flagged)'))}>
            <Mdi path={mdiClipboardCheckOutline} size={18} />
            {t('Open Inspection Checklist')}
          </button>
        </div>
      </section>

      <footer className="fw-footnote">
        <span>{t('OliveWatch AI Matrix • Built for the resilience of Palestinian Olive Heritage')}</span>
        <span>{t('Beita Farmers Cooperative')}</span>
        <span>{t('Palestine Quality Mark (PQM-OLIVE)')}</span>
        <span>{t('Offline PWA Sync Active')}</span>
      </footer>
    </>
  );
}
