// One printed page: folio (number + label) on the right of the axis, content on the left of it.
import { ReactNode } from 'react';

export type Tone = 'ground' | 'sage' | 'gold' | 'olive' | 'ink';

export default function Page({ tone, id, n, label, children }: { tone: Tone; id?: string; n?: string; label?: string; children: ReactNode }) {
  const dark = tone === 'olive' || tone === 'ink';
  return (
    <section id={id} className={`page page-${tone}${dark ? ' on-dark' : ''}`} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="axis">
        <div className="folio" aria-hidden="true">
          {n && <span className="n">{n}</span>}
          {label && <span className="t">{label}</span>}
        </div>
        <div className="body">{children}</div>
      </div>
    </section>
  );
}
