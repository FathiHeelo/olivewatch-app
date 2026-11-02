// Live demo: three sliders recompute the Climate Stress Index in the browser with the proposal's formula.
import { useState } from 'react';
import Page from '../components/Page';
import { climateStressIndex, stressBand } from '../csi';

type SliderProps = { id: string; label: string; unit: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void };

function Slider({ id, label, unit, min, max, step, value, onChange }: SliderProps) {
  return (
    <div className="slider">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>
          {/* Latin units (°C) stay in one left-to-right run with the number; Arabic units follow it. */}
          {unit === '°C' ? <bdi className="ltr">{`${value} °C`}</bdi> : <><bdi className="ltr">{value}</bdi> {unit}</>}
        </output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export default function LiveDemo() {
  const [dT, setDT] = useState(2);
  const [deficit, setDeficit] = useState(20);
  const [dry, setDry] = useState(10);

  // The slider shows a rainfall DEFICIT in mm; the formula takes the anomaly dP, which is negative for a deficit.
  const csi = climateStressIndex(dT, -deficit, dry);
  const band = stressBand(csi);
  const terms = [
    { label: 'الحرارة', pct: Math.min(dT / 4, 1) * 40 },
    { label: 'نقص المطر', pct: Math.min(deficit / 40, 1) * 40 },
    { label: 'أيام الجفاف', pct: Math.min(dry / 30, 1) * 20 },
  ];

  return (
    <Page tone="ground" id="demo" n="02" label="جرّب بنفسك">
      <h2 id="demo-title" className="h2">
        مؤشر الإجهاد المناخي،
        <br />
        يُحسب أمامك
      </h2>
      <p className="para">حرّك المنزلقات الثلاثة. المدخلات توضيحية (تجريبية) وليست قياسات من حقل حقيقي.</p>

      <div className="demo">
        <div className="sliders">
          <Slider id="dT" label="ارتفاع الحرارة" unit="°C" min={0} max={6} step={0.1} value={dT} onChange={setDT} />
          <Slider id="dP" label="نقص المطر" unit="ملم" min={0} max={60} step={1} value={deficit} onChange={setDeficit} />
          <Slider id="dd" label="أيام الجفاف المتتالية" unit="يوم" min={0} max={40} step={1} value={dry} onChange={setDry} />
        </div>

        <div className="csi-card" role="status" aria-live="polite">
          <div className="csi-head">
            <span>مؤشر الإجهاد المناخي</span>
            <span className="chip">تجريبية</span>
          </div>
          <div className="csi-value" data-testid="csi-value">
            <bdi className="ltr">
              {csi.toFixed(1)}
              <span className="csi-of"> / 100</span>
            </bdi>
          </div>
          <div className={`csi-band band-${band.band}`} data-testid="csi-band">
            {band.label}
          </div>
          <div className="csi-track" aria-hidden="true">
            <div className="csi-fill" style={{ width: `${csi}%` }} />
          </div>
          <ul className="csi-terms">
            {terms.map((t) => (
              <li key={t.label}>
                <span>{t.label}</span>
                <bdi className="ltr">{t.pct.toFixed(1)}</bdi>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="formula">
        <bdi className="ltr">CSI = 100 × (0.4·min(ΔT/4, 1) + 0.4·min(−ΔP/40, 1) + 0.2·min(d/30, 1))</bdi>
      </p>
    </Page>
  );
}
