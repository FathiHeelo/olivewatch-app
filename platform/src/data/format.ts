// Formatting helpers. Numbers and Latin ids sit inside Arabic text, so they are wrapped in Unicode
// isolates (U+2066 .. U+2069) to keep the bidi algorithm from reordering them.
const LRI = '⁦';
const PDI = '⁩';

export const isolate = (s: string | number) => `${LRI}${s}${PDI}`;

const nf = new Intl.NumberFormat('en-US');
export const fmtNum = (n: number) => nf.format(n);

const months = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];

// "2026-10-07" -> "7 تشرين الأول 2026"
export function fmtDate(iso?: string, withYear = true): string | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return `${isolate(d)} ${months[m - 1]}${withYear ? ` ${isolate(y)}` : ''}`;
}

// The % sign must stay on the right of the digits, so digits and sign are one isolated run.
export const fmtPct = (v: number) => isolate(`${Math.round(v * 100)}%`);

export const todayISO = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

// Monday of the ISO week that contains the given date, as YYYY-MM-DD (local calendar, no time zones).
export function weekStart(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const back = (dt.getUTCDay() + 6) % 7; // Monday = 0
  dt.setUTCDate(dt.getUTCDate() - back);
  return dt.toISOString().slice(0, 10);
}

// Next free id of the form B-<year>-<4 digits>.
export function nextBatchId(existing: string[], year: string): string {
  const prefix = `B-${year}-`;
  const max = existing
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}
