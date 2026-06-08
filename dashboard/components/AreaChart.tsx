'use client';

import { useId } from 'react';

// Gładki wykres area (czysty SVG, zero zależności): wypełnienie gradientem akcentu + linia.
// preserveAspectRatio="none" → rozciąga się na pełną szerokość; stroke trzymany non-scaling.
export default function AreaChart({
  values,
  height = 160,
  className = '',
}: {
  values: number[];
  height?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const n = values.length;
  if (n === 0) return null;
  const max = Math.max(1, ...values);
  const W = 100;
  const H = 100;
  const x = (i: number) => (n > 1 ? (i / (n - 1)) * W : W / 2);
  const y = (v: number) => H - (v / max) * H;
  const line = values
    .map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)} ${y(v).toFixed(2)}`)
    .join(' ');
  const area = `${line} L${W.toFixed(2)} ${H} L0 ${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ height }}
      className={`w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--accent-rgb))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgb(var(--accent-rgb))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#area-${id})`} />
      <path
        d={line}
        fill="none"
        stroke="rgb(var(--accent-rgb))"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
