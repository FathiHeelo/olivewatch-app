// Hand-written SVG charts, measured to their container so text stays a readable size on a phone.
// Time runs right to left (Arabic reading order). Single series, no legend, olive only on the data mark.
import { useEffect, useRef, useState } from 'react';
import { fmtNum } from '../data/format';

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.floor(el.clientWidth)));
    ro.observe(el);
    setW(Math.floor(el.clientWidth));
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

// Round the axis maximum up to 1, 2 or 5 times a power of ten.
function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}

const PAD = { top: 20, bottom: 30, side: 44 };

// `short` is used when a bar slot is too narrow for the full label (phones).
export function BarChart({ data, height = 260, label }: { data: { label: string; short?: string; value: number }[]; height?: number; label: string }) {
  const [ref, w] = useWidth();
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const innerW = Math.max(0, w - PAD.side - 8);
  const innerH = height - PAD.top - PAD.bottom;
  const slot = data.length ? innerW / data.length : 0;
  const barW = Math.min(56, slot * 0.55);
  const ticks = [0, max / 2, max];
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  return (
    <div ref={ref} className="chart">
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={label}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={8} x2={w - PAD.side} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="1" />
              <text x={w - PAD.side + 8} y={y(t) + 4} className="axis-text">
                {fmtNum(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = w - PAD.side - slot * (i + 0.5);
            const top = y(d.value);
            return (
              <g key={d.label}>
                <rect x={cx - barW / 2} y={top} width={barW} height={PAD.top + innerH - top} rx="2" fill="var(--accent)" />
                <text x={cx} y={top - 6} textAnchor="middle" className="value-text">
                  {fmtNum(d.value)}
                </text>
                <text x={cx} y={height - 8} textAnchor="middle" className="axis-text">
                  {slot < 100 ? d.short ?? d.label : d.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

export function LineChart({
  data,
  domain,
  height = 240,
  label,
  format = (v: number) => v.toFixed(2),
}: {
  data: { label: string; value: number }[];
  domain: [number, number];
  height?: number;
  label: string;
  format?: (v: number) => string;
}) {
  const [ref, w] = useWidth();
  const [lo, hi] = domain;
  const innerW = Math.max(0, w - PAD.side - 40); // leaves room at the left end for the last label
  const innerH = height - PAD.top - PAD.bottom;
  const y = (v: number) => PAD.top + innerH - ((v - lo) / (hi - lo)) * innerH;
  const x = (i: number) => w - PAD.side - 8 - (data.length > 1 ? (innerW * i) / (data.length - 1) : innerW / 2);
  const points = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
  const ticks = [lo, (lo + hi) / 2, hi];
  const last = data[data.length - 1];

  return (
    <div ref={ref} className="chart">
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={label}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={8} x2={w - PAD.side} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="1" />
              <text x={w - PAD.side + 8} y={y(t) + 4} className="axis-text">
                {format(t)}
              </text>
            </g>
          ))}
          <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {data.map((d, i) => (
            <text key={d.label} x={x(i)} y={height - 8} textAnchor="middle" className="axis-text">
              {d.label}
            </text>
          ))}
          {last && (
            <g>
              <circle cx={x(data.length - 1)} cy={y(last.value)} r="4" fill="var(--accent)" />
              <text x={x(data.length - 1)} y={y(last.value) - 10} textAnchor="middle" className="value-text">
                {format(last.value)}
              </text>
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
