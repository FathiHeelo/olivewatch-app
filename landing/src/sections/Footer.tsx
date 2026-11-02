import FitText from '../components/FitText';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-mark">
        <FitText label="أوليف ووتش">أوليف ووتش</FitText>
      </div>
      <p className="footer-note">
        عرض تجريبي. كل البيانات في هذا الموقع تجريبية أو محاكاة. الفحص أولي وليس شهادة جودة، ورمز QR لا يثبت أصالة المنتج.
      </p>
    </footer>
  );
}
