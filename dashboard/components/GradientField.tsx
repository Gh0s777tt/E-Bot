'use client';

// Faza 7 / F1 — gradient (od/do/kąt) z live-preview. Używany w grafikach (karty rang, banery — F2).
import { tp } from '../lib/panelI18n';
import ColorField from './ColorField';
import { useLang } from './LangContext';

export type Gradient = { from: string; to: string; angle: number };

export function gradientCss(g: Gradient): string {
  return `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`;
}

export default function GradientField({
  value,
  onChange,
}: {
  value: Gradient;
  onChange: (g: Gradient) => void;
}) {
  const { lang } = useLang();
  return (
    <div className="space-y-3">
      <div
        className="h-16 w-full rounded-lg border border-line"
        style={{ background: gradientCss(value) }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          label={tp(lang, 'ui.cardstyle.gradFrom')}
          value={value.from}
          onChange={(from) => onChange({ ...value, from })}
        />
        <ColorField
          label={tp(lang, 'ui.cardstyle.gradTo')}
          value={value.to}
          onChange={(to) => onChange({ ...value, to })}
        />
      </div>
      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.cardstyle.gradAngle')} {value.angle}°
        </span>
        <input
          type="range"
          min={0}
          max={360}
          value={value.angle}
          onChange={(e) => onChange({ ...value, angle: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </label>
    </div>
  );
}
