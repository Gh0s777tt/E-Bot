'use client';

// Faza 7 / F2 — edytor stylu karty/banera: gradient + czcionka + kolor tekstu + live-preview.
// Podgląd używa prawdziwych webfontów (Google Fonts) tych samych rodzin, co bot renderuje w obrazie.
import { useEffect } from 'react';
import { CARD_FONTS, type CardStyle } from '../lib/cardStyle';
import ColorField from './ColorField';
import GradientField from './GradientField';

const GF_URL =
  'https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Lobster&family=Pacifico&family=Poppins:wght@400;700&display=swap';

export default function CardStyleEditor({
  value,
  onChange,
  previewText = 'GH0ST EMPIRE',
}: {
  value: CardStyle;
  onChange: (s: CardStyle) => void;
  previewText?: string;
}) {
  useEffect(() => {
    if (document.getElementById('gf-cards')) return;
    const l = document.createElement('link');
    l.id = 'gf-cards';
    l.rel = 'stylesheet';
    l.href = GF_URL;
    document.head.appendChild(l);
  }, []);

  return (
    <div className="space-y-4">
      <div
        className="flex h-28 items-center justify-center rounded-xl border border-line"
        style={{ background: `linear-gradient(${value.angle}deg, ${value.from}, ${value.to})` }}
      >
        <span
          className="text-3xl font-bold"
          style={{ color: value.textColor, fontFamily: `'${value.font}', sans-serif` }}
        >
          {previewText}
        </span>
      </div>

      <GradientField
        value={{ from: value.from, to: value.to, angle: value.angle }}
        onChange={(g) => onChange({ ...value, ...g })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Czcionka</span>
          <select
            value={value.font}
            onChange={(e) => onChange({ ...value, font: e.target.value })}
            className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
            style={{ fontFamily: `'${value.font}', sans-serif` }}
          >
            {CARD_FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <ColorField
          label="Kolor tekstu"
          value={value.textColor}
          onChange={(textColor) => onChange({ ...value, textColor })}
        />
      </div>
    </div>
  );
}
