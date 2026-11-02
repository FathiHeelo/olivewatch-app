// Frank questions: full-bleed bands, every answer visible (no accordions).
import { ReactNode } from 'react';

const qa: { tone: string; q: string; a: ReactNode }[] = [
  { tone: 'gold', q: 'هل يقدّم التطبيق نصيحة علاجية؟', a: 'لا. فحص الورقة أولي وليس تشخيصاً نهائياً، ولا نقترح علاجاً. استشر مختصاً زراعياً.' },
  { tone: 'sage', q: 'هل فحص الزيت شهادة جودة؟', a: <>لا. هو فحص أولي. إذا قلّت الثقة عن <bdi className="ltr">60%</bdi> نقول «يحتاج تحقق مخبري» ولا نسمّي أي فئة.</> },
  { tone: 'olive', q: 'هل يثبت رمز QR أصالة المنتج؟', a: 'لا. الرمز يربط الدفعة بسجلها فقط. لا يثبت أن العبوة أصلية.' },
  { tone: 'ink', q: 'من يملك بيانات المزرعة؟', a: 'المزارع.' },
];

export default function Questions() {
  return (
    <section id="questions" aria-labelledby="questions-title">
      <h2 id="questions-title" className="sr-only">
        أسئلة صريحة
      </h2>
      {qa.map((item, i) => {
        const dark = item.tone === 'olive' || item.tone === 'ink';
        return (
          <div key={item.q} className={`band page-${item.tone}${dark ? ' on-dark' : ''}`}>
            <div className="axis">
              <div className="folio" aria-hidden="true">
                {i === 0 && <span className="t">أسئلة صريحة</span>}
              </div>
              <div className="body">
                <h3 className="q">{item.q}</h3>
                <p className="a">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
