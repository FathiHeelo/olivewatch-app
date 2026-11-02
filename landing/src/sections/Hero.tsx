import Page from '../components/Page';

export default function Hero() {
  return (
    <Page tone="ground" id="hero" label="أوليف ووتش">
      <p className="kicker">عرض تجريبي · بيانات تجريبية ومحاكاة، لا بيانات حقيقية بعد</p>
      <h1 id="hero-title" className="hero-title reveal">
        من الشجرة
        <br />
        إلى الزيت
      </h1>
      <p className="lede">
        أوليف ووتش يتابع حقول الزيتون الفلسطينية من فحص الورقة إلى المعصرة إلى رمز الدفعة على الزجاجة.
      </p>
      <a className="btn" href="#demo">
        جرّب العرض
      </a>
    </Page>
  );
}
