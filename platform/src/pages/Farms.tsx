import { mdiAlertOutline, mdiPineTree } from '@mdi/js';
import Mdi from '../components/Mdi';
import { useHome } from '../data/farm';
import { useLang } from '../i18n';

export default function Farms() {
  const { home, status } = useHome();
  const { t, pick } = useLang();
  const { farm, plots } = home;
  if (status === 'loading') return <div className="state" role="status">{t('Loading…')}</div>;

  return (
    <>
      <header className="fw-section-head">
        <div>
          <small className="fw-eyebrow">{pick(farm.location ?? '', farm.locationEn ?? '')}</small>
          <h1>{pick(farm.name, farm.nameEn ?? farm.name)}</h1>
          <p className="muted">
            {farm.areaDunum} {t('Dunums')} • {farm.trees} {t('Trees')}
          </p>
        </div>
      </header>

      <section className="fw-section">
        <header className="fw-section-head">
          <h2>{t('Plots')}</h2>
        </header>
        <div className="fw-plot-grid">
          {plots.map((p) => {
            const bad = p.status === 'needs_check';
            return (
              <article key={p.id} className="fw-card fw-plot">
                <span className={`fw-ico ${bad ? 'red' : 'lime'}`}>
                  <Mdi path={bad ? mdiAlertOutline : mdiPineTree} size={22} />
                </span>
                <div>
                  <h3>{pick(p.name, p.nameEn ?? p.id)}</h3>
                  <p className="muted">
                    {p.trees} {t('Trees')}
                  </p>
                  <p className="muted">
                    {t('Last check')}: {pick(p.lastCheck, `${p.lastCheckDays} ${t('days ago')}`)}
                  </p>
                </div>
                <em className={`fw-chip ${bad ? 'red' : 'lime'}`}>{bad ? t('Needs Check') : t('Healthy')}</em>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
