// Phone-width preview of the public consumer page for one batch. Every line says who it comes from:
// the farmer reported it, the platform computed it, or nobody has checked it independently.
import { climateStressIndex, stressBand } from '../data/csi';
import { fmtNum, isolate } from '../data/format';
import { Batch, Mill, Supplier } from '../data/types';
import { Dash, Ltr } from './ui';

type Flag = 'farmer' | 'platform' | 'none';
const flagLabel: Record<Flag, string> = {
  farmer: 'أفاد به المزارع',
  platform: 'حسبته المنصة',
  none: 'تحقق مستقل: لا يوجد',
};

function Line({ flag, label, children }: { flag: Flag; label: string; children: React.ReactNode }) {
  return (
    <div className="cp-line">
      <div className="cp-line-main">
        <span className="muted">{label}</span>
        <strong>{children}</strong>
      </div>
      <span className={`chip cp-flag cp-${flag}`}>{flagLabel[flag]}</span>
    </div>
  );
}

export default function ConsumerPreview({ batch, mill, supplier }: { batch: Batch; mill: Mill | null; supplier?: Supplier }) {
  const csi = supplier ? climateStressIndex(supplier.dT, supplier.dP, supplier.dryDays) : undefined;
  const yieldPct = batch.oilLitres != null ? ((batch.oilLitres / batch.oliveKg) * 100).toFixed(1) : undefined;

  return (
    <div className="phone" aria-label="معاينة الصفحة العامة للمستهلك">
      <div className="phone-screen">
        <p className="cp-kicker">جواز الدفعة · عرض تجريبي</p>
        <h2 className="cp-title">زيت زيتون من منطقة نابلس</h2>
        <dl className="cp-facts">
          <div>
            <dt>المنطقة</dt>
            <dd>منطقة نابلس</dd>
          </div>
          <div>
            <dt>المعصرة</dt>
            <dd>{mill?.name ?? <Dash />}</dd>
          </div>
          <div>
            <dt>الموسم</dt>
            <dd>{mill ? isolate(mill.season) : <Dash />}</dd>
          </div>
          <div>
            <dt>رقم الدفعة</dt>
            <dd>
              <Ltr>{batch.id}</Ltr>
            </dd>
          </div>
        </dl>

        <Line flag="farmer" label="القرية">
          {batch.village}
        </Line>
        <Line flag="farmer" label="وزن الزيتون">
          {fmtNum(batch.oliveKg)} كغ
        </Line>
        <Line flag="platform" label="نسبة الزيت">
          {yieldPct ? `${isolate(yieldPct)} لتر لكل ${isolate(100)} كغ` : <Dash />}
        </Line>
        <Line flag="platform" label="الإجهاد المناخي للموسم">
          {csi != null ? `${isolate(csi.toFixed(1))} · ${stressBand(csi).label}` : <Dash />}
        </Line>
        <Line flag="none" label="جودة الزيت">
          <Dash />
        </Line>

        <p className="cp-note">بيانات تجريبية. رمز QR يربط الدفعة بسجلها ولا يثبت أصالة المنتج.</p>
      </div>
    </div>
  );
}
