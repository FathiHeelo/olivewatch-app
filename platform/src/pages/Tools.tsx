import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import Toolkit from './dashboard/Toolkit';

// AI tools, plus the mill pages that were built earlier (they keep working under their own routes).
const mill = [
  { to: '/tools/uv', label: 'UV Scan' },
  { to: '/mill', label: 'Mill dashboard' },
  { to: '/batches', label: 'Batches' },
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/samples', label: 'Samples' },
  { to: '/climate', label: 'Climate & Satellites' },
  { to: '/traceability', label: 'Traceability & Reports' },
];

export default function Tools() {
  const { t } = useLang();
  return (
    <>
      <header className="fw-section-head">
        <div>
          <h1>{t('AI Tools')}</h1>
          <p className="muted">{t('AI-assisted tools for the grove, the mill and the bottle.')}</p>
        </div>
      </header>
      <Toolkit />
      <section className="fw-section">
        <header className="fw-section-head">
          <h2>{t('Mill dashboard')}</h2>
        </header>
        <div className="fw-chips wrap">
          {mill.map((m) => (
            <Link key={m.to} to={m.to} className="fw-btn outline press">
              {t(m.label)}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
