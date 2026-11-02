// Shell from the Stitch "Farmer Web Dashboard": brand card, threat-alert chip, five-item nav, language switch and
// settings in the sidebar (on the start side: right in Arabic, left in English); search, location + weather, and the
// user in the top bar.
import { mdiAccountOutline, mdiBellOutline, mdiBrain, mdiChartTimelineVariant, mdiCheckDecagram, mdiCloudSync, mdiCogOutline, mdiHomeOutline, mdiMagnify, mdiMapMarker, mdiPineTree, mdiRadar, mdiSprout, mdiThermometer, mdiTranslate } from '@mdi/js';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useMillData } from '../data/DataProvider';
import { useLang } from '../i18n';
import Mdi from './Mdi';
import { useOverlays } from './overlays/OverlayProvider';

const nav = [
  { to: '/', label: 'Home', icon: mdiHomeOutline, end: true },
  { to: '/farms', label: 'My Farms', icon: mdiPineTree },
  { to: '/tools', label: 'AI Tools', icon: mdiBrain },
  { to: '/analytics', label: 'Analytics', icon: mdiChartTimelineVariant },
  { to: '/profile', label: 'Profile', icon: mdiAccountOutline },
];

export default function Shell() {
  const { t, pick, toggle, lang } = useLang();
  const { status } = useMillData();
  const { open, toast } = useOverlays();

  return (
    <div className="fw-shell">
      <aside className="fw-side">
        <div className="fw-brand">
          <span className="fw-logo">
            <Mdi path={mdiSprout} size={26} />
          </span>
          <span className="fw-brand-text">
            <strong>OliveWatch AI</strong>
            <span>{t('Palestine Agritech Matrix')}</span>
          </span>
        </div>

        <Link to="/farms" className="fw-alert-chip press">
          <Mdi path={mdiRadar} size={20} />
          <span>{t('AI Threat Alert')}</span>
          <em>{t('Plot 4B')}</em>
        </Link>

        <nav className="fw-nav" aria-label={pick('التنقل الرئيسي', 'Main navigation')}>
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `fw-nav-row press${isActive ? ' active' : ''}`}>
              <Mdi path={n.icon} size={22} />
              <span>{t(n.label)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="fw-side-foot">
          <button type="button" className="fw-lang-card press" onClick={toggle} aria-label={t('Switch language')}>
            <Mdi path={mdiTranslate} size={22} />
            <span>{t('Arabic / EN')}</span>
            <em>{lang === 'ar' ? '(RTL) العربية' : '(LTR) English'}</em>
          </button>
          <Link to="/profile" className="fw-nav-row press">
            <Mdi path={mdiCogOutline} size={22} />
            <span>{t('Settings')}</span>
          </Link>
          <div className="fw-node">{t('LoRaWAN Mill Node 04: Live')}</div>
        </div>
      </aside>

      <div className="fw-main">
        <header className="fw-top">
          <Link to="/" className="fw-icon-btn press" aria-label={t('Search')}>
            <Mdi path={mdiMagnify} size={22} />
          </Link>
          <div className="fw-loc">
            <Mdi path={mdiMapMarker} size={18} />
            <span>{t('Beita, Nablus')}</span>
            <i aria-hidden="true" />
            <Mdi path={mdiThermometer} size={18} />
            <span>{t('24°C Sunny, mild')}</span>
          </div>
          <span className="fw-top-gap" />
          <button type="button" className="fw-icon-btn press" aria-label="Cloud sync" onClick={() => toast(pick('تمت مزامنة القياسات السحابية عبر الشبكة الزراعية الفلسطينية', 'Cloud telemetry synced via Palestinian Agrinet'))}>
            <Mdi path={mdiCloudSync} size={20} />
          </button>
          <button type="button" className="fw-icon-btn press" aria-label={t('Notifications')}>
            <Mdi path={mdiBellOutline} size={20} />
            <b className="fw-dot" />
          </button>
          <button type="button" className="fw-pill-btn press" onClick={toggle} aria-label={t('Switch language')}>
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          <button type="button" className="fw-cert press" onClick={() => open('certify')}>
            <Mdi path={mdiCheckDecagram} size={18} />
            <span>{t('Certify Press Lot')}</span>
          </button>
          <button type="button" className="fw-user press" onClick={() => toast(pick('ملف أبو خالد: مدرّجات بيتا موثّقة', 'Abu Khaled profile: Terraces of Beita verified'))}>
            <span className="fw-avatar">
              <Mdi path={mdiAccountOutline} size={22} />
            </span>
            <span>
              <strong>{pick('أبو خالد', 'Abu Khaled')}</strong>
              <small>{t('Certified Producer')}</small>
            </span>
          </button>
        </header>

        {status === 'fallback' && (
          <div className="banner" role="alert">
            {pick('قاعدة البيانات غير متصلة — تُعرض بيانات محلية ولن تُحفظ أي تغييرات.', 'The database is offline — showing local data; changes will not be saved.')}
          </div>
        )}

        <main className="fw-content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
