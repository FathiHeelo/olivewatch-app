import { mdiBrain, mdiWeatherHurricane, mdiLineScan, mdiMicroscope, mdiQrcode } from '@mdi/js';
import { useNavigate } from 'react-router-dom';
import Mdi from '../../components/Mdi';
import { useLang } from '../../i18n';
import { useOverlays } from '../../components/overlays/OverlayProvider';

// Each module opens the page that already exists for it (the mill pages stay reachable from here).
const tools = [
  { n: '01 • Diagnostic Vision', title: 'AI Leaf Disease Scanner', text: 'Instant neural leaf upload for Peacock Spot & Knot diagnosis with 94.6% laboratory precision.', cta: 'Scan Leaf Now', icon: mdiLineScan, tone: 'dark', act: 'scanner' },
  { n: '02 • Agronomist Chat', title: 'AI Agricultural Advisor', text: 'Specialized Souri terroir chatbot answering organic fertilization, pruning timing, and organic Bordeaux prep.', cta: 'Consult Agronomist', icon: mdiBrain, tone: 'lime', act: 'agronomist' },
  { n: '03 • Predictive Stress', title: 'Climate Intelligence & Simulator', text: 'Simulate heatwaves, cold front chilling hours, and seasonal soil aquifer retention scenarios.', cta: 'Run Simulator', icon: mdiWeatherHurricane, tone: 'gray', act: 'simulator', to: '/analytics' },
  { n: '04 • Spectral Purity', title: 'Olive Oil UV Analyzer', text: '365nm spectral fluorescence verification preventing adulteration and guaranteeing Extra Virgin status.', cta: 'Check UV Spectrum', icon: mdiMicroscope, tone: 'amber', act: 'uv', to: '/samples' },
  { n: '05 • Proof of Terroir', title: 'Smart Traceability & QR', text: 'Export passport generation with cryptographically certified harvest timestamps and council origin seals.', cta: 'Generate Batch QR', icon: mdiQrcode, tone: 'ink', act: 'certify' },
];

export default function Toolkit() {
  const { t, pick } = useLang();
  const { open, toast } = useOverlays();
  const go = useNavigate();
  const run = (a: string, to?: string) => {
    if (a === 'scanner' || a === 'agronomist' || a === 'certify') open(a);
    else if (a === 'simulator') toast(pick('جارٍ تحميل محاكي إجهاد المناخ المحلي لمدرّجات 4ب', 'Loading microclimate stress simulator for Terraces 4B'));
    else toast(pick('مقياس الفلورة UV (يو في) 365nm جاهز للدفعة PAL-NAB-098', 'UV 365nm Fluorometer ready for Lot PAL-NAB-098'));
    if (to) go(to);
  };
  return (
    <section className="fw-section">
      <header className="fw-section-head">
        <div>
          <small className="fw-eyebrow">{t('Autonomous Neural Agronomy')}</small>
          <h2>{t('Your AI Agricultural Toolkit')}</h2>
        </div>
        <em className="fw-chip gray">{t('5 Modules Active')}</em>
      </header>
      <div className="fw-tool-grid">
        {tools.map((x) => (
          <button type="button" key={x.n} className="fw-card fw-tool press" onClick={() => run(x.act, x.to)}>
            <span className={`fw-tool-ico ${x.tone}`}>
              <Mdi path={x.icon} size={26} />
            </span>
            <small className="fw-eyebrow">{t(x.n)}</small>
            <h3>{t(x.title)}</h3>
            <p className="muted">{t(x.text)}</p>
            <span className="fw-tool-cta">{t(x.cta)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
