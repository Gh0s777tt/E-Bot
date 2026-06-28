'use client';

import { Radio } from 'lucide-react';
import { useState } from 'react';
import type { LiveConfig } from '../lib/live';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

// Kanały źródłowe (brand — nietłumaczone); placeholder = przykładowy format (bez słów → bez i18n).
const FIELDS: { key: keyof LiveConfig; label: string; ph: string }[] = [
  { key: 'twitch', label: 'Twitch', ph: 'ninja' },
  { key: 'kick', label: 'Kick', ph: 'xqc' },
  { key: 'youtube', label: 'YouTube', ph: 'UCxxxxxxxxxxxx' },
  { key: 'rumble', label: 'Rumble', ph: 'https://…/api' },
];

export default function LiveConfigForm({ initial }: { initial: LiveConfig }) {
  const { lang } = useLang();
  const [c, setC] = useState<LiveConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const anyOn = Object.values(c).some((v) => v.trim().length > 0);

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/live-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <section className="panel-glow rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
        <Radio size={16} className="text-accent" /> {tp(lang, 'ui.live.cfgHeading')}
        <span
          className={`status-pill ms-auto normal-case${anyOn ? ' is-on' : ''}`}
          aria-hidden="true"
        >
          <span className="dot" />
          {anyOn ? tp(lang, 'ui.cmd.on') : tp(lang, 'ui.cmd.off')}
        </span>
      </h2>
      <p className="mb-4 text-xs text-muted">{tp(lang, 'ui.live.cfgHint')}</p>
      <div className="grid max-w-xl gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">{f.label}</span>
            <input
              value={c[f.key]}
              onChange={(e) => setC({ ...c, [f.key]: e.target.value })}
              placeholder={f.ph}
              className={inputCls}
            />
          </label>
        ))}
      </div>
      <div className="mt-4">
        <SaveButton st={st} onClick={save} />
      </div>
    </section>
  );
}
