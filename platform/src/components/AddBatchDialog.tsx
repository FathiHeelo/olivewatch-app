// "تسجيل دفعة جديدة": writes a new batch to /batches in Realtime Database. It refuses (and says so) when the
// database is not live, so it never pretends something was saved.
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMillData } from '../data/DataProvider';
import { nextBatchId, todayISO } from '../data/format';
import { addBatch } from '../data/repository';
import { Batch } from '../data/types';

export default function AddBatchDialog({ onClose }: { onClose: () => void }) {
  const { mill, suppliers, batches, status } = useMillData();
  const navigate = useNavigate();
  const [picked, setPicked] = useState('');
  const supplierId = picked || suppliers[0]?.id || ''; // default to the first supplier even if data arrives late
  const [kg, setKg] = useState('');
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const live = status === 'live';

  async function submit(e: FormEvent) {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === supplierId);
    const oliveKg = Number(kg);
    if (!live) return setError('الحفظ غير متاح: قاعدة البيانات غير متصلة.');
    if (!supplier) return setError('اختر المورد.');
    if (!Number.isFinite(oliveKg) || oliveKg <= 0) return setError('أدخل وزن الزيتون بالكيلوغرام.');

    const id = nextBatchId(batches.map((b) => b.id), mill?.season ?? date.slice(0, 4));
    const batch: Batch = {
      id,
      millId: mill?.id ?? 'mill-nasr',
      supplierId: supplier.id,
      village: supplier.village,
      receivedAt: date,
      oliveKg,
      status: 'processing', // not pressed yet: no oilLitres field
      source: 'تجريبية',
    };
    setSaving(true);
    setError('');
    try {
      await addBatch(batch);
      onClose();
      navigate(`/batches/${id}`);
    } catch (err) {
      setError(`تعذّر الحفظ: ${(err as Error).message}`);
      setSaving(false);
    }
  }

  return (
    <div className="dialog-scrim" role="presentation" onClick={onClose}>
      <form className="dialog" role="dialog" aria-modal="true" aria-label="تسجيل دفعة جديدة" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>تسجيل دفعة جديدة</h2>
        {!live && <p className="error-text">الحفظ غير متاح: قاعدة البيانات غير متصلة. لن تُحفظ أي دفعة.</p>}
        <label className="field">
          المورد
          <select value={supplierId} onChange={(e) => setPicked(e.target.value)} name="supplier">
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          وزن الزيتون (كغ)
          <input name="kg" type="number" inputMode="numeric" min="1" step="1" value={kg} onChange={(e) => setKg(e.target.value)} autoFocus />
        </label>
        <label className="field">
          تاريخ الاستلام
          <input name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <p className="muted" style={{ fontSize: 13 }}>
          تُسجَّل الدفعة بحالة «قيد المعالجة» ومصدر «تجريبية»، ولا تحمل كمية زيت قبل العصر.
        </p>
        {error && <p className="error-text">{error}</p>}
        <div className="dialog-actions">
          <button type="submit" className="btn btn-primary press" disabled={saving || !live}>
            {saving ? 'جارٍ الحفظ…' : 'حفظ الدفعة'}
          </button>
          <button type="button" className="btn btn-outline press" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
