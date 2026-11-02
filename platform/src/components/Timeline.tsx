// Batch timeline: one step per stage. A stage with no date yet is shown as not done, with a grey dash.
import { ReactNode } from 'react';
import { Dash } from './ui';

export type Step = { label: string; detail?: ReactNode; done: boolean };

export default function Timeline({ steps }: { steps: Step[] }) {
  return (
    <ol className="timeline">
      {steps.map((s) => (
        <li key={s.label} className={s.done ? 'done' : ''}>
          <span className="tl-dot" aria-hidden="true" />
          <span className="tl-body">
            <strong>{s.label}</strong>
            <span className="muted">{s.detail ?? <Dash />}</span>
          </span>
          <span className="sr-only">{s.done ? 'تمت' : 'لم تتم بعد'}</span>
        </li>
      ))}
    </ol>
  );
}
