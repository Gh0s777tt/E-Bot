'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { tp } from '../lib/panelI18n';
import { THEME_PRESETS } from '../lib/themes';
import ColorField, { hexToRgb } from './ColorField';
import { useLang } from './LangContext';

function applyChannels(rgb: string, hover: string, dark: string) {
  const r = document.documentElement;
  r.style.setProperty('--accent-rgb', rgb);
  r.style.setProperty('--accent-hover-rgb', hover);
  r.style.setProperty('--accent-dark-rgb', dark);
}

function applyPreset(p: { rgb: string; hover: string; dark: string }) {
  applyChannels(p.rgb, p.hover, p.dark);
}

// Faza 7 / F1 — dowolny HEX akcentu (poza presetami). Hover = jaśniej, dark = ciemniej.
function applyHex(hex: string): boolean {
  const c = hexToRgb(hex);
  if (!c) return false;
  const li = (v: number) => Math.min(255, Math.round(v * 1.15));
  const dk = (v: number) => Math.round(v * 0.6);
  applyChannels(
    `${c.r} ${c.g} ${c.b}`,
    `${li(c.r)} ${li(c.g)} ${li(c.b)}`,
    `${dk(c.r)} ${dk(c.g)} ${dk(c.b)}`,
  );
  return true;
}

export default function ThemeSwitcher() {
  const { lang } = useLang();
  const [active, setActive] = useState('red');
  const [hex, setHex] = useState('#E50914');

  useEffect(() => {
    const customHex = localStorage.getItem('accentHex');
    if (customHex && applyHex(customHex)) {
      setHex(customHex);
      setActive('custom');
      return;
    }
    const id = localStorage.getItem('accent') || 'red';
    const p = THEME_PRESETS.find((x) => x.id === id);
    if (p) {
      applyPreset(p);
      setActive(id);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {THEME_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              applyPreset(p);
              localStorage.setItem('accent', p.id);
              localStorage.removeItem('accentHex');
              setActive(p.id);
            }}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              active === p.id ? 'border-white bg-white/5' : 'border-line hover:bg-elevated'
            }`}
          >
            <span
              className="grid h-5 w-5 place-items-center rounded-full"
              style={{ background: `rgb(${p.rgb})` }}
            >
              {active === p.id && <Check size={12} className="text-white" />}
            </span>
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-bg/40 p-3">
        <ColorField
          label={tp(lang, 'ui.settings.customColorLabel')}
          value={hex}
          onChange={(v) => {
            setHex(v);
            if (applyHex(v)) {
              localStorage.setItem('accentHex', v);
              localStorage.removeItem('accent');
              setActive('custom');
            }
          }}
        />
        {active === 'custom' && (
          <span className="pb-2 text-xs text-green-400">
            ✓ {tp(lang, 'ui.settings.customActive')}
          </span>
        )}
      </div>
    </div>
  );
}
