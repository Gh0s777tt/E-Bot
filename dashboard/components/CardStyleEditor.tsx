'use client';

// Faza 7 / F2 — edytor stylu karty/banera: gradient + czcionka + kolor tekstu + live-preview.
// Podgląd używa prawdziwych webfontów (Google Fonts) tych samych rodzin, co bot renderuje w obrazie.
import { type ReactNode, useEffect } from 'react';
import { CARD_FONTS, type CardStyle } from '../lib/cardStyle';
import { tp } from '../lib/panelI18n';
import ColorField from './ColorField';
import GradientField from './GradientField';
import { useLang } from './LangContext';

const GF_URL =
  'https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Lobster&family=Pacifico&family=Poppins:wght@400;700&display=swap';

// Gotowe motywy — jeden klik wypełnia cały styl (gradient + czcionka + kolor tekstu); potem można dostroić.
const THEMES: { nameKey: string; emoji: string; style: CardStyle }[] = [
  {
    nameKey: 'ui.cardstyle.themeNetflix',
    emoji: '🔴',
    style: { from: '#E50914', to: '#0A0A0A', angle: 135, font: 'Poppins', textColor: '#FFFFFF' },
  },
  {
    nameKey: 'ui.cardstyle.themeOcean',
    emoji: '🌊',
    style: { from: '#2E3192', to: '#1BFFFF', angle: 135, font: 'Poppins', textColor: '#FFFFFF' },
  },
  {
    nameKey: 'ui.cardstyle.themeSunset',
    emoji: '🌅',
    style: { from: '#FF512F', to: '#DD2476', angle: 135, font: 'Bebas Neue', textColor: '#FFFFFF' },
  },
  {
    nameKey: 'ui.cardstyle.themeForest',
    emoji: '🌲',
    style: { from: '#134E5E', to: '#71B280', angle: 135, font: 'Poppins', textColor: '#FFFFFF' },
  },
  {
    nameKey: 'ui.cardstyle.themeMidnight',
    emoji: '🌌',
    style: { from: '#0F2027', to: '#2C5364', angle: 135, font: 'Anton', textColor: '#FFFFFF' },
  },
  {
    nameKey: 'ui.cardstyle.themeGold',
    emoji: '✨',
    style: { from: '#F7971E', to: '#FFD200', angle: 135, font: 'Anton', textColor: '#1A1A1A' },
  },
  {
    nameKey: 'ui.cardstyle.themeNeon',
    emoji: '💜',
    style: { from: '#8E2DE2', to: '#4A00E0', angle: 135, font: 'Bebas Neue', textColor: '#FFFFFF' },
  },
  {
    nameKey: 'ui.cardstyle.themeMono',
    emoji: '⬛',
    style: { from: '#232526', to: '#414345', angle: 135, font: 'Poppins', textColor: '#FFFFFF' },
  },
];

export default function CardStyleEditor({
  value,
  onChange,
  previewText = 'E-Forge',
  preview,
}: {
  value: CardStyle;
  onChange: (s: CardStyle) => void;
  previewText?: string;
  // Opcjonalny bogatszy podgląd (np. pełna karta rangi) — zastępuje domyślny swatch gradientu.
  preview?: ReactNode;
}) {
  const { lang } = useLang();
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
      {preview ?? (
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
      )}

      <div className="space-y-1">
        <span className="text-xs text-muted">{tp(lang, 'ui.cardstyle.themesLabel')}</span>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((th) => (
            <button
              key={th.nameKey}
              type="button"
              onClick={() => onChange(th.style)}
              title={`${tp(lang, 'ui.cardstyle.applyTheme')} „${tp(lang, th.nameKey)}"`}
              className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold transition hover:scale-105 hover:border-accent"
              style={{
                background: `linear-gradient(${th.style.angle}deg, ${th.style.from}, ${th.style.to})`,
                color: th.style.textColor,
              }}
            >
              {th.emoji} {tp(lang, th.nameKey)}
            </button>
          ))}
        </div>
      </div>

      <GradientField
        value={{ from: value.from, to: value.to, angle: value.angle }}
        onChange={(g) => onChange({ ...value, ...g })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.cardstyle.fontLabel')}</span>
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
          label={tp(lang, 'ui.cardstyle.textColorLabel')}
          value={value.textColor}
          onChange={(textColor) => onChange({ ...value, textColor })}
        />
      </div>
    </div>
  );
}
