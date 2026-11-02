import { mdiClose } from '@mdi/js';
import { useHome } from '../../data/farm';
import { useLang } from '../../i18n';
import Mdi from '../Mdi';
import { useOverlays } from './OverlayProvider';

const terraces = [
  { ar: 'سلسلة الجبل العلوية (المدرّجات 1-4)', en: 'Upper mountain chain (Terraces 1-4)', trees: 145, kind: ['صوري رومي', 'Souri Roumi'], note: ['مراقبة رطوبة (Plot 4B)', 'Moisture watch (Plot 4B)'], warn: true },
  { ar: 'الحوض الأوسط (المدرّجات 5-11)', en: 'Central basin (Terraces 5-11)', trees: 280, kind: ['صوري عتيق', 'Ancient Souri'], note: ['ممتاز (NDVI (إن دي في آي) 0.79)', 'Excellent (NDVI 0.79)'] },
  { ar: 'مدرّج الوادي الغربي (المدرّجات 12-16)', en: 'West valley terrace (Terraces 12-16)', trees: 195, kind: ['صوري', 'Souri'], note: ['ممتاز (NDVI (إن دي في آي) 0.82)', 'Excellent (NDVI 0.82)'] },
];

export default function FarmModal() {
  const { pick, rtl } = useLang();
  const { close, toast } = useOverlays();
  const { home } = useHome();
  const { farm } = home;
  const i = rtl ? 0 : 1;

  return (
    <div className="fw-scrim" role="presentation" onClick={close}>
      <section className="fw-modal wide" role="dialog" aria-modal="true" aria-label={pick('تفاصيل البيارة', 'Grove details')} onClick={(e) => e.stopPropagation()}>
        <header className="fw-modal-head">
          <div>
            <small className="fw-eyebrow">Registry: PAL-NAB-420B</small>
            <h2>
              {pick('تفاصيل', 'Details of')} {pick(farm.name, farm.nameEn ?? farm.name)}
            </h2>
            <p className="muted">{pick('حيازة عائلية موثقة - بلدة بيتا، محافظة نابلس', 'Documented family holding - Beita, Nablus governorate')}</p>
          </div>
          <button type="button" className="fw-x" onClick={close} aria-label={pick('إغلاق', 'Close')}>
            <Mdi path={mdiClose} size={22} />
          </button>
        </header>

        <div className="fw-farm-stats">
          <div>
            <small>{pick('المساحة الكلية', 'Total area')}</small>
            <strong>
              {farm.areaDunum} {pick('دونم', 'Dunums')}
            </strong>
          </div>
          <div>
            <small>{pick('عدد الأشجار', 'Tree count')}</small>
            <strong>
              {farm.trees} {pick('شجرة', 'trees')}
            </strong>
          </div>
          <div>
            <small>{pick('عمر الأشجار التقديري', 'Estimated tree age')}</small>
            <strong>{pick('180 - 450 عام', '180 - 450 years')}</strong>
          </div>
          <div>
            <small>{pick('طبيعة الزراعة', 'Farming type')}</small>
            <strong>{pick('بعلية (Rainfed)', 'Rainfed')}</strong>
          </div>
        </div>

        <h3>{pick('توزيع المدرّجات الجبلية', 'Mountain terraces census')}</h3>
        <ul className="fw-census">
          {terraces.map((x) => (
            <li key={x.en}>
              <div>
                <strong>{pick(x.ar, x.en)}</strong>
                <span className="muted">
                  {x.trees} {pick('شجرة', 'trees')} {x.kind[i]}
                </span>
              </div>
              <em className={`fw-chip ${x.warn ? 'amber' : 'lime'}`}>{x.note[i]}</em>
            </li>
          ))}
        </ul>

        <footer className="fw-modal-foot">
          <button type="button" className="fw-btn outline press" onClick={close}>
            {pick('إغلاق', 'Close')}
          </button>
          <button type="button" className="fw-btn dark press" onClick={() => toast(pick('تم تحميل شهادة الحيازة الرقمية', 'Digital holding certificate downloaded'))}>
            {pick('تصدير تقرير الحيازة الزراعية', 'Export agricultural holding report')}
          </button>
        </footer>
      </section>
    </div>
  );
}
