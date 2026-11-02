import { mdiCheckDecagram, mdiClose } from '@mdi/js';
import { useState } from 'react';
import { useLang } from '../../i18n';
import Mdi from '../Mdi';
import { useOverlays } from './OverlayProvider';

export default function CertifyModal() {
  const { pick } = useLang();
  const { close, toast } = useOverlays();
  const [lot, setLot] = useState('PAL-NAB-2024-LOT-102');

  function issue() {
    close();
    toast(pick(`تم توثيق عصرة الزيتون #${lot} بنجاح وإصدار شهادة المنشأ`, `Olive press lot #${lot} certified and origin certificate issued`));
  }

  return (
    <div className="fw-scrim" role="presentation" onClick={close}>
      <section className="fw-modal" role="dialog" aria-modal="true" aria-label="Certify Press Lot" onClick={(e) => e.stopPropagation()}>
        <header className="fw-modal-head">
          <h2 className="with-ico">
            <Mdi path={mdiCheckDecagram} size={24} /> {pick('توثيق عصرة زيتون • Certify Press Lot', 'Certify Press Lot')}
          </h2>
          <button type="button" className="fw-x" onClick={close} aria-label={pick('إغلاق', 'Close')}>
            <Mdi path={mdiClose} size={22} />
          </button>
        </header>

        <div className="fw-form">
          <label>
            {pick('رمز الدفعة المعصرة (Lot ID)', 'Pressed lot code (Lot ID)')}
            <input value={lot} onChange={(e) => setLot(e.target.value)} dir="ltr" />
          </label>
          <label>
            {pick('المعصرة المعتمدة (Certified Press)', 'Certified press')}
            <input readOnly value={pick('معصرة الأصالة الحديثة - بيتا (Al-Asalah Two-Phase Mill)', 'Al-Asalah Modern Press - Beita (Two-Phase Mill)')} />
          </label>
          <div className="fw-form-row">
            <label>
              {pick('درجة حرارة العصر', 'Pressing temperature')}
              <input readOnly dir="ltr" value={pick('25.8 °م (عصر على البارد)', '25.8 °C (Cold Press)')} className="ok" />
            </label>
            <label>
              {pick('الحموضة المقاسة (FFA (إف إف إيه))', 'Measured acidity (FFA)')}
              <input readOnly value={pick('0.28% (بكر ممتاز)', '0.28% (Extra Virgin)')} className="ok" />
            </label>
          </div>
        </div>

        <footer className="fw-modal-foot">
          <button type="button" className="fw-btn gold press" onClick={issue}>
            {pick('إصدار الختم الرقمي والبوليصة', 'Issue digital seal and policy')}
          </button>
          <button type="button" className="fw-btn soft press" onClick={close}>
            {pick('إغلاق', 'Close')}
          </button>
        </footer>
      </section>
    </div>
  );
}
