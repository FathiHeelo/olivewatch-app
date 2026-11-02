import Page from '../components/Page';

// What each source is for, and what is simulated in this demo, stated plainly. Today nothing is real.
const sources = [
  { name: 'NASA POWER', role: 'بيانات الحرارة والأرصاد من الأقمار والمحطات.', demo: 'في العرض: قيم المناخ محاكاة. لم نجلب شيئاً من هذا المصدر بعد.' },
  { name: 'CHIRPS', role: 'تقديرات الهطول المطري.', demo: 'في العرض: غير موصول. نقص المطر قيمة تجريبية.' },
  { name: 'Sentinel-2', role: 'صور أقمار صناعية يُحسب منها مؤشر الغطاء النباتي NDVI.', demo: 'في العرض: سلسلة NDVI محاكاة، ولا تشخّص الأمراض بمفردها.' },
  { name: 'MobileNetV2', role: 'نموذج لتصنيف صورة ورقة الزيتون.', demo: 'في العرض: نتيجة الفحص تجريبية وأولية. لا نعرض أي نسبة دقة.' },
  { name: 'Random Forest', role: 'نموذج لفحص عيّنة الزيت أولياً.', demo: 'في العرض: النتائج محاكاة، وليست شهادة جودة.' },
];

export default function DataSources() {
  return (
    <Page tone="olive" id="sources" n="03" label="مصادر البيانات">
      <h2 id="sources-title" className="h2">
        مصادر البيانات،
        <br />
        وما هو محاكى فيها
      </h2>
      <p className="para">اليوم لا شيء حقيقي في هذا العرض. كل قيمة تحمل وسماً: حقيقية، أو تجريبية، أو محاكاة.</p>
      <div className="sources">
        {sources.map((s) => (
          <article key={s.name} className="source">
            <h3>
              <bdi className="ltr">{s.name}</bdi>
            </h3>
            <p>{s.role}</p>
            <p className="source-demo">{s.demo}</p>
          </article>
        ))}
      </div>
    </Page>
  );
}
