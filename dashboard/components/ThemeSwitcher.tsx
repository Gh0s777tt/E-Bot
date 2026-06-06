'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { THEME_PRESETS } from '../lib/themes';

function apply(p: { rgb: string; hover: string; dark: string }) {
  const r = document.documentElement;
  r.style.setProperty('--accent-rgb', p.rgb);
  r.style.setProperty('--accent-hover-rgb', p.hover);
  r.style.setProperty('--accent-dark-rgb', p.dark);
}

export default function ThemeSwitcher() {
  const [active, setActive] = useState('red');

  useEffect(() => {
    setActive(localStorage.getItem('accent') || 'red');
  }, []);

  return (
    <div className="flex flex-wrap gap-3">
      {THEME_PRESETS.map((p) => (
        <button
          key={p.id}
          onClick={() => {
            apply(p);
            localStorage.setItem('accent', p.id);
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
  );
}
