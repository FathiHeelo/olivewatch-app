// AI agronomist drawer. The opening conversation is the design's scripted example; every NEW question goes to the
// gateway (/ai/advisor, Gemini). If the gateway is unset, down, or the free-tier limit is hit, a canned reply is
// shown and labelled "Simulated", and a limit notice explains why.
import { mdiBrain, mdiClose, mdiSend, mdiSwapVertical } from '@mdi/js';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { aiAdvisor, AiFail, sourceChip } from '../../data/aiClient';
import { useHome } from '../../data/farm';
import { useLang } from '../../i18n';
import Mdi from '../Mdi';
import { useOverlays } from './OverlayProvider';

type Msg = { from: 'bot' | 'farmer'; text: string; tip?: string; src?: 'gemini' | 'simulated'; note?: string };

export default function AgronomistDrawer() {
  const { pick, lang } = useLang();
  const { close } = useOverlays();
  const { home } = useHome();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const [msgs, setMsgs] = useState<Msg[]>(() => [
    { from: 'bot', text: pick('مرحباً أبو خالد، قمت بتحليل قراءات أجهزة الاستشعار في القطعة (Plot 4B) في بيتا.', 'Hello Abu Khaled, I analysed the sensor readings in Plot 4B in Beita.') },
    {
      from: 'bot',
      text: pick(
        'نسبة الرطوبة الصباحية تجاوزت 86% مع تكاثف الندى، مما يزيد من احتمالية انتشار فطر عين الطاووس (Spilocaea oleaginea (سبيلوسيا أوليجينيا)).',
        'Morning humidity exceeded 86% with heavy dew, raising the chance of Peacock Spot fungus (Spilocaea oleaginea) spreading.',
      ),
      tip: pick('توصية: الرش الوقائي بمركب كبريتات النحاس العضوي (جنزارة) بتركيز 1% قبل هطول الأمطار المتوقعة.', 'Recommendation: preventive spray with organic copper sulfate (Bordeaux mixture) at 1% before the expected rain.'),
    },
    { from: 'farmer', text: pick('هل يؤثر رش النحاس في هذه الفترة على جودة زيت الزيتون أو حموضته عند العصر؟', 'Will copper spraying now affect olive oil quality or its acidity at pressing?') },
    {
      from: 'bot',
      text: pick(
        'اطمئن يا أبا خالد. المركبات النحاسية العضوية المعتمدة لا تمتص داخل لب الثمرة ولا تنتقل إلى الزيت عند الغسيل الجيد في المعصرة الحديثة. فترة الأمان PHI (بي إتش آي) هي 14 يوماً، وموعد عصر حقولك بعد 18 يوماً، مما يضمن خلو الزيت من أي متبقيات والحفاظ على تصنيف البكر الممتاز.',
        'Rest assured, Abu Khaled. Approved organic copper compounds are not absorbed into the fruit pulp and do not pass into the oil when washed well at the modern mill. The pre-harvest interval (PHI) is 14 days and your fields are pressed in 18 days, so the oil stays residue-free and keeps its Extra Virgin grade.',
      ),
    },
  ]);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [msgs, busy]);

  const simulated = () =>
    pick(
      'تم تسجيل استفسارك حول تربة بيتا وحساب مؤشرات المناخ. ينصح بإجراء المعاملة الوقائية في ساعات الصباح الباكر لضمان جفاف رذاذ الرش على الأوراق.',
      'Your question about Beita soil and the climate indices is logged. Do the preventive treatment in the early morning hours so the spray dries on the leaves.',
    );

  const why = (f: AiFail) =>
    f.limit
      ? pick(`بلغنا حدّ الاستخدام المجاني لـ Gemini${f.retryAfter ? `. أعد المحاولة بعد ${f.retryAfter} ثانية` : '. أعد المحاولة بعد قليل'}.`, `The free Gemini limit was reached${f.retryAfter ? `. Try again in ${f.retryAfter} s` : '. Try again shortly'}.`)
      : f.error === 'not_configured'
        ? pick('المرشد الحي غير مضبوط (VITE_AI_URL).', 'The live advisor is not configured (VITE_AI_URL).')
        : pick('تعذّر الوصول إلى المرشد الحي.', 'The live advisor could not be reached.');

  async function ask(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const history = [...msgs, { from: 'farmer', text: q } as Msg];
    setMsgs(history);
    setInput('');
    setBusy(true);
    const r = await aiAdvisor(
      history.map((m) => ({ role: m.from === 'farmer' ? ('user' as const) : ('assistant' as const), text: m.text })),
      lang,
      // Trusted app data only: what the app itself knows.
      { farm: { name: home.farm.nameEn ?? home.farm.name, areaDunum: home.farm.areaDunum, trees: home.farm.trees }, activeAlert: 'Peacock Spot risk in Plot 4B (morning humidity 86%)', climateStressIndex: home.climate.csi },
    );
    setBusy(false);
    setMsgs((m) => [...m, r.ok ? { from: 'bot', text: r.data.reply, src: 'gemini' } : { from: 'bot', text: simulated(), src: 'simulated', note: why(r) }]);
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <div className="fw-scrim end" role="presentation" onClick={close}>
      <aside className="fw-drawer" role="dialog" aria-modal="true" aria-label={pick('المرشد الزراعي الذكي', 'AI Agricultural Advisor')} onClick={(e) => e.stopPropagation()}>
        <header className="fw-drawer-head">
          <span className="fw-drawer-ico">
            <Mdi path={mdiBrain} size={26} />
          </span>
          <div>
            <h2>{pick('المرشد الزراعي الذكي', 'AI Agricultural Advisor')}</h2>
            <small>OliveWatch AI Terroir Agronomist • Beita Terroir</small>
          </div>
          <button type="button" className="fw-x" onClick={close} aria-label={pick('إغلاق', 'Close')}>
            <Mdi path={mdiClose} size={22} />
          </button>
        </header>

        <div className="fw-chat" ref={box}>
          {msgs.map((m, i) => (
            <div key={i} className={`fw-msg ${m.from}`}>
              <span className="fw-msg-av">{m.from === 'bot' ? 'AI' : 'AK'}</span>
              <div className="fw-bubble">
                <p>{m.text}</p>
                {m.tip ? <p className="fw-tip">{m.tip}</p> : null}
                {m.src ? <em className={`fw-chip ${m.src === 'gemini' ? 'lime' : 'gray'}`}>{sourceChip(m.src, lang)}</em> : null}
                {m.note ? <small className="muted">{m.note}</small> : null}
              </div>
            </div>
          ))}
          {busy ? (
            <div className="fw-msg bot" role="status">
              <span className="fw-msg-av">AI</span>
              <div className="fw-bubble">
                <p className="muted">{pick('جارٍ الكتابة…', 'Typing…')}</p>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="fw-chat-foot">
          <div className="fw-quick">
            <button type="button" className="fw-chip outline press" onClick={() => void ask(pick('ما هو موعد القطاف المثالي لصنف الصوري؟', 'What is the ideal harvest date for the Souri variety?'))}>
              <Mdi path={mdiSwapVertical} size={14} /> {pick('موعد قطاف الصوري', 'Souri harvest date')}
            </button>
            <button type="button" className="fw-chip outline press" onClick={() => void ask(pick('كيف أتأكد من ضبط حرارة المعصرة دون 27 درجة؟', 'How do I make sure the mill stays below 27°C?'))}>
              <Mdi path={mdiSwapVertical} size={14} /> {pick('حرارة العصر البارد', 'Cold-press temperature')}
            </button>
          </div>
          <form onSubmit={submit} className="fw-chat-form">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={pick('اكتب استفسارك الزراعي هنا...', 'Ask the agronomist here...')} aria-label={pick('استفسار', 'Question')} />
            <button type="submit" className="fw-send press" aria-label={pick('إرسال', 'Send')} disabled={busy}>
              <Mdi path={mdiSend} size={20} />
            </button>
          </form>
        </footer>
      </aside>
    </div>
  );
}
