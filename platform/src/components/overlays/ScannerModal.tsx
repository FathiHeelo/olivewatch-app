// Leaf scanner. The chosen photo goes to the gateway (/ai/leaf, Gemini). The result is a PRELIMINARY screening:
// below 0.70 confidence (or a poor image) it says "unclear image, retake" and names no disease. If the gateway is
// unset, down or rate-limited, the design's fixed example is shown instead and labelled "Simulated".
import { mdiCamera, mdiClose, mdiLineScan } from '@mdi/js';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { aiLeaf, AiFail, LeafAi, sourceChip } from '../../data/aiClient';
import { useLang } from '../../i18n';
import Mdi from '../Mdi';
import { useOverlays } from './OverlayProvider';

type Outcome = { src: 'gemini'; data: LeafAi } | { src: 'simulated'; why: AiFail };

export default function ScannerModal() {
  const { pick, lang } = useLang();
  const { close, toast } = useOverlays();
  const input = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<Outcome>();

  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo);
    },
    [photo],
  );

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setOut(undefined);
    setBusy(true);
    const r = await aiLeaf(file, lang);
    setBusy(false);
    setOut(r.ok ? { src: 'gemini', data: r.data } : { src: 'simulated', why: r });
    if (r.ok && !r.data.rejected) toast(pick(`تم فحص الورقة (فحص أولي): ${Math.round(r.data.confidence * 100)}%`, `Leaf screened (preliminary): ${Math.round(r.data.confidence * 100)}%`));
  }

  const names: Record<string, string> = {
    healthy: pick('ورقة سليمة', 'Healthy leaf'),
    peacock_spot: pick('عين الطاووس (Spilocaea oleaginea (سبيلوسيا أوليجينيا))', 'Peacock Spot (Spilocaea oleaginea)'),
    aculus_olearius: pick('ضرر الحلم Aculus olearius (أكولوس أوليريوس)', 'Mite damage (Aculus olearius)'),
  };

  const whyText = (f: AiFail) =>
    f.limit
      ? pick('بلغنا حدّ الاستخدام المجاني لـ Gemini. أعد المحاولة بعد قليل.', 'The free Gemini limit was reached. Try again shortly.')
      : f.error === 'not_configured'
        ? pick('الفحص الحي غير مضبوط (VITE_AI_URL).', 'Live screening is not configured (VITE_AI_URL).')
        : pick('تعذّر الوصول إلى الفحص الحي.', 'Live screening could not be reached.');

  return (
    <div className="fw-scrim" role="presentation" onClick={close}>
      <section className="fw-modal" role="dialog" aria-modal="true" aria-label={pick('فاحص الأوراق بالذكاء الاصطناعي', 'AI Leaf Scanner')} onClick={(e) => e.stopPropagation()}>
        <header className="fw-modal-head">
          <h2 className="with-ico">
            <Mdi path={mdiLineScan} size={24} /> {pick('فاحص الأوراق بالذكاء الاصطناعي', 'AI Leaf Scanner')}
          </h2>
          <button type="button" className="fw-x" onClick={close} aria-label={pick('إغلاق', 'Close')}>
            <Mdi path={mdiClose} size={22} />
          </button>
        </header>

        <div className="fw-drop">
          {photo ? <img src={photo} alt={pick('الورقة المختارة', 'Selected leaf')} /> : <Mdi path={mdiCamera} size={44} />}
          <h3>{pick('التقط صورة لورقة الزيتون أو ارفع ملف', 'Take a photo of an olive leaf or upload a file')}</h3>
          <p className="muted">{pick('فحص أولي بنموذج Gemini من صورة واحدة بأشعة الشمس الطبيعية', 'Preliminary screening of one photo in natural sunlight by a Gemini model')}</p>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden onChange={onPick} />
          <button type="button" className="fw-btn olive press" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? pick('جارٍ التحليل…', 'Analysing…') : pick('اختيار صورة الورقة', 'Choose leaf photo')}
          </button>
        </div>

        {out?.src === 'gemini' && (
          <div className="fw-scan-result" role="status">
            {out.data.rejected ? (
              <strong>{pick('الصورة غير واضحة، أعد التصوير', 'Unclear image, please retake')}</strong>
            ) : (
              <>
                <strong>{pick('النتيجة: ', 'Result: ') + names[out.data.label]}</strong>
                <em className="fw-chip lime">{pick(`ثقة ${Math.round(out.data.confidence * 100)}%`, `Confidence ${Math.round(out.data.confidence * 100)}%`)}</em>
              </>
            )}
            {out.data.reason_text ? <p className="muted">{out.data.reason_text}</p> : null}
            <em className="fw-chip gray">{sourceChip('gemini', lang)}</em>
            <p className="muted small">{pick('فحص أولي وليس تشخيصاً نهائياً، ولا نقدّم نصائح علاجية.', 'Preliminary check, not a final diagnosis; no treatment advice is given.')}</p>
          </div>
        )}

        {out?.src === 'simulated' && (
          <div className="fw-scan-result" role="status">
            <strong>{pick('النتيجة (مثال): عين الطاووس (Spilocaea oleaginea (سبيلوسيا أوليجينيا))', 'Result (example): Peacock Spot (Spilocaea oleaginea)')}</strong>
            <em className="fw-chip gray">{sourceChip('simulated', lang)}</em>
            <p className="muted">{whyText(out.why)}</p>
            <p className="muted small">{pick('هذا مثال ثابت وليس نتيجة فحص صورتك.', 'This is a fixed example, not a result for your photo.')}</p>
          </div>
        )}

        <footer className="fw-modal-foot">
          <button type="button" className="fw-btn soft press" onClick={close}>
            {pick('إلغاء', 'Cancel')}
          </button>
        </footer>
      </section>
    </div>
  );
}
