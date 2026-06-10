'use client';

import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import type { EcoSeasonConfig } from '../lib/serverEconomy';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));

export default function EcoSeasonForm({
  initial,
  guild,
  currency,
}: {
  initial: EcoSeasonConfig;
  guild: GuildMeta;
  currency: string;
}) {
  const [c, setC] = useState<EcoSeasonConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/eco-season', {
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

  const Reward = (label: string, key: 'reward1' | 'reward2' | 'reward3') => (
    <label className="space-y-1 text-sm">
      <span className="font-semibold text-white/90">{label}</span>
      <input
        type="number"
        value={c[key]}
        onChange={(e) => setC({ ...c, [key]: num(e.target.value) })}
        className={inputCls}
      />
    </label>
  );

  return (
    <div className="max-w-2xl space-y-4">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.enabled}
          onChange={(e) => setC({ ...c, enabled: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">Sezon ekonomii włączony</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Kanał ogłoszeń sezonu</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
          placeholder="— wybierz kanał —"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        {Reward(`🥇 Nagroda #1 (${currency})`, 'reward1')}
        {Reward(`🥈 Nagroda #2 (${currency})`, 'reward2')}
        {Reward(`🥉 Nagroda #3 (${currency})`, 'reward3')}
      </div>

      <label className="flex items-center gap-2.5 rounded-xl border border-line bg-bg/40 p-3 text-sm">
        <input
          type="checkbox"
          checked={c.reset}
          onChange={(e) => setC({ ...c, reset: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span>
          <span className="font-semibold text-white/90">Reset sald po sezonie</span>
          <span className="ml-1 text-muted">
            — zeruje portfele i banki wszystkich (podium dostaje nagrodę już w nowym sezonie).
          </span>
        </span>
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Co miesiąc (1. dnia) bot ogłasza top‑10 najbogatszych, wypłaca nagrody podium (trafiają do
        historii jako „sezon") i — jeśli włączysz — resetuje salda. Nagroda 0 = bez wypłaty dla
        danego miejsca.
      </p>
    </div>
  );
}
