'use client';

// Faza 7 / F1 — pole koloru: natywny picker + HEX + podgląd RGB. Akceptuje #RGB/#RRGGBB.
import { useId } from 'react';

function normalizeHex(v: string): string {
  let s = v.trim().replace(/^#?/, '#');
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    s = `#${s
      .slice(1)
      .split('')
      .map((c) => c + c)
      .join('')}`;
  }
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s.toUpperCase() : '';
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = normalizeHex(hex);
  if (!h) return null;
  return {
    r: Number.parseInt(h.slice(1, 3), 16),
    g: Number.parseInt(h.slice(3, 5), 16),
    b: Number.parseInt(h.slice(5, 7), 16),
  };
}

export default function ColorField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
}) {
  const id = useId();
  const valid = normalizeHex(value) || '#E50914';
  const rgb = hexToRgb(valid);
  return (
    <div className="space-y-1 text-sm">
      {label && <span className="font-semibold text-white/90">{label}</span>}
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={valid}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-9 w-12 cursor-pointer rounded-md border border-line bg-elevated p-0.5"
          aria-label={label ?? 'Kolor'}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#E50914"
          className="w-28 rounded-md border border-line bg-elevated px-3 py-2 font-mono text-sm uppercase outline-none focus:border-accent"
        />
        {rgb && (
          <span className="text-xs text-muted">
            rgb({rgb.r}, {rgb.g}, {rgb.b})
          </span>
        )}
      </div>
    </div>
  );
}
