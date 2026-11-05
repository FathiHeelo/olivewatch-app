import { mdiAccountOutline, mdiInformationOutline, mdiShieldCheckOutline } from '@mdi/js';
import Mdi from '../components/Mdi';
import { useLang } from '../i18n';
import { uvText } from '../uv/zaytoun-i18n';

export default function Profile() {
  const { t, pick, toggle, lang } = useLang();
  const uv = uvText(lang);
  return (
    <>
      <section className="fw-card fw-profile">
        <span className="fw-avatar big">
          <Mdi path={mdiAccountOutline} size={34} />
        </span>
        <div>
          <h1>{pick('أبو خالد', 'Abu Khaled')}</h1>
          <p className="muted">
            {t('Certified Producer')} • {t('Beita, Nablus')}
          </p>
        </div>
      </section>

      <section className="fw-card fw-profile-row">
        <span>{t('Arabic / EN')}</span>
        <button type="button" className="fw-btn outline press" onClick={toggle}>
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
      </section>

      <section className="fw-card fw-profile-row">
        <Mdi path={mdiShieldCheckOutline} size={22} />
        <span>{t('Your farm data belongs to you.')}</span>
      </section>

      {/* Credits */}
      <section className="fw-card fw-profile-row" aria-label={uv.credit}>
        <Mdi path={mdiInformationOutline} size={22} />
        <span>
          {uv.credit}:{' '}
          <a href={uv.creditUrl} target="_blank" rel="noreferrer">
            {uv.creditUrl}
          </a>
        </span>
      </section>
    </>
  );
}
