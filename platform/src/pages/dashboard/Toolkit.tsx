import { mdiBrain, mdiWeatherHurricane, mdiLineScan, mdiMicroscope, mdiQrcode } from '@mdi/js';
import { useNavigate } from 'react-router-dom';
import Mdi from '../../components/Mdi';
import { useLang } from '../../i18n';
import { useOverlays } from '../../components/overlays/OverlayProvider';

// Each module opens the page that already exists for it (the mill pages stay reachable from here).
const tools = [
  { n: '01 • Diagnostic Vision', title: 'AI Leaf Disease Scanner', text: 'Upload a leaf photo for a preliminary Peacock Spot or mite-damage screening.', cta: 'Scan Leaf Now', icon: mdiLineScan, tone: 'dark', act: 'scanner' },
  { n: '02 • Agronomist Chat', title: 'AI Agricultural Advisor', text: 'Specialized Souri terroir chatbot answering organic fertilization, pruning timing, and organic Bordeaux prep.', cta: 'Consult Agronomist', icon: mdiBrain, tone: 'lime', act: 'agronomist' },
  { n: '03 • Predictive Stress', title: 'Climate Intelligence & Simulator', text: 'Simulate heatwaves, cold front chilling hours, and seasonal soil aquifer retention scenarios.', cta: 'Run Simulator', icon: mdiWeatherHurricane, tone: 'gray', act: 'simulator', to: '/analytics' },
  { n: '04 • UV Screening', title: 'UV Scan', text: 'Preliminary UV fluorescence screening of a sample photo, with history and a printable report.', cta: 'Open UV Scan', icon: mdiMicroscope, tone: 'amber', act: 'uv', to: '/tools/uv' },
  { n: '05 • Proof of Terroir', title: 'Smart Traceability & QR', text: 'Export passport generation with cryptographically certified harvest timestamps and council origin seals.', cta: 'Generate Batch QR', icon: mdiQrcode, tone: 'ink', act: 'certify' },
];

export default function Toolkit() {
  const { t, pick } = useLang();
  const { open, toast } = useOverlays();
  const go = useNavigate();
  const run = (a: string, to?: string) => {
    if (a === 'scanner' || a === 'agronomist' || a === 'certify') open(a);
    else if (a === 'simulator') toast(pick('جارٍ تحميل محاكي إجهاد المناخ المحلي لمدرّجات 4ب', 'Loading microclimate stress simulator for Terraces 4B'));
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
