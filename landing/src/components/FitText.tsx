// Draws text so it spans the full width of its container. The SVG viewBox is set from the measured text box, so
// the glyphs are scaled uniformly (no stretching of Arabic letterforms) and the line never overflows.
import { useLayoutEffect, useRef, useState } from 'react';

export default function FitText({ children, label }: { children: string; label: string }) {
  const text = useRef<SVGTextElement>(null);
  const [box, setBox] = useState<string>('0 0 100 40');

  useLayoutEffect(() => {
    const el = text.current;
    if (!el) return;
    const measure = () => {
      const b = el.getBBox();
      if (b.width > 0) setBox(`${b.x} ${b.y} ${b.width} ${b.height}`);
    };
    measure();
    // Re-measure once the web font has loaded: the fallback font has different metrics.
    document.fonts?.ready.then(measure);
  }, [children]);

  return (
    <svg viewBox={box} width="100%" role="img" aria-label={label} style={{ display: 'block' }}>
      <text ref={text} x="0" y="0" dominantBaseline="hanging" fontFamily="IBM Plex Sans Arabic, system-ui, sans-serif" fontWeight="700" fontSize="100" fill="currentColor">
        {children}
      </text>
    </svg>
  );
}
