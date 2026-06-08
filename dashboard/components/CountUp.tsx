'use client';

import { useEffect, useRef, useState } from 'react';

// Animowany licznik 0→value (easeOutCubic). Respektuje prefers-reduced-motion (od razu wartość).
export default function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || duration <= 0) {
      setN(value);
      from.current = value;
      return;
    }
    let raf = 0;
    let start = 0;
    const begin = from.current;
    const ease = (t: number) => 1 - (1 - t) ** 3;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setN(Math.round(begin + (value - begin) * ease(p)));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{n.toLocaleString('pl-PL')}</>;
}
