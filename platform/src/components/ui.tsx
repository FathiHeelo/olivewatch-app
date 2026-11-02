import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isolate } from '../data/format';
import { BatchStatus, ScreeningResult, Source, STATUS_LABEL } from '../data/types';

// A missing value is a grey dash, never 0 and never blank.
export const Dash = () => (
  <span className="dash" aria-label="لا توجد قيمة">
    —
  </span>
);

export const Val = ({ children }: { children: ReactNode | undefined }) => (children == null || children === '' ? <Dash /> : <>{children}</>);

// Latin text or an id inside Arabic: keep it as one left-to-right run.
export const Ltr = ({ children }: { children: string | number }) => (
  <bdi dir="ltr" className="ltr">
    {children}
  </bdi>
);

// Source chip: حقيقية / تجريبية / محاكاة. Everything shown today is تجريبية or محاكاة.
export const SourceChip = ({ source }: { source: Source }) => <span className="chip chip-source">{source}</span>;

export type Tone = 'neutral' | 'accent' | 'warning' | 'negative';
export const Pill = ({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) => <span className={`pill pill-${tone}`}>{children}</span>;

const statusTone: Record<BatchStatus, Tone> = { complete: 'accent', processing: 'neutral', needs_review: 'warning' };
export const StatusPill = ({ status }: { status: BatchStatus }) => <Pill tone={statusTone[status]}>{STATUS_LABEL[status]}</Pill>;

export const screeningLabel: Record<ScreeningResult, string> = {
  within_reference: 'ضمن النطاق المرجعي',
  needs_lab: 'يحتاج تحقق مخبري',
  pending: 'بانتظار الفحص',
};
const screeningTone: Record<ScreeningResult, Tone> = { within_reference: 'accent', needs_lab: 'warning', pending: 'neutral' };
export const ScreeningPill = ({ result }: { result: ScreeningResult }) => <Pill tone={screeningTone[result]}>{screeningLabel[result]}</Pill>;

export function PageHeader({ title, chip, actions }: { title: string; chip?: Source; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div className="page-title">
        <h1>{title}</h1>
        {chip && <SourceChip source={chip} />}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export const Card = ({ title, aside, children, className = '' }: { title?: string; aside?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={`card ${className}`}>
    {(title || aside) && (
      <header className="card-head">
        {title && <h2>{title}</h2>}
        {aside}
      </header>
    )}
    {children}
  </section>
);

export const Loading = ({ label = 'جارٍ التحميل…' }: { label?: string }) => (
  <div className="state" role="status">
    {label}
  </div>
);

export const Empty = ({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) => (
  <div className="state">
    <strong>{title}</strong>
    {hint && <span className="muted">{hint}</span>}
    {action}
  </div>
);

export const ButtonLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="btn btn-outline press">
    {children}
  </Link>
);

export const BatchId = ({ id }: { id: string }) => <Ltr>{id}</Ltr>;

export const kgText = (n?: number, unit = 'كغ') => (n == null ? undefined : `${isolate(n.toLocaleString('en-US'))} ${unit}`);
