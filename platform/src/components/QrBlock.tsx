// QR block. The code links a batch to its record; it does not prove that the product is authentic.
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

export default function QrBlock({ batchId }: { batchId: string }) {
  const [src, setSrc] = useState('');
  const url = `${window.location.origin}/batches/${batchId}`;

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(url, { margin: 1, width: 192, color: { dark: '#191D12', light: '#FFFFFF' } })
      .then((d) => alive && setSrc(d))
      .catch(() => alive && setSrc(''));
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <div className="qr">
      {src ? <img src={src} width={192} height={192} alt={`رمز QR لسجل الدفعة ${batchId}`} /> : <div className="qr-placeholder" aria-hidden="true" />}
      <p className="muted">رمز QR يربط الدفعة بسجلها ولا يثبت أصالة المنتج.</p>
    </div>
  );
}
