'use client';

import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';

type Cfg = { enabled: boolean; channelId: string; threshold: number; emoji: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(1, Math.floor(Number(v) || 1));

export default function StarboardForm({ initial, guild }: { initial: Cfg; guild: GuildMeta }) {
  const [c, setC] = useState<Cfg>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/starboard', {
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
    <div className="max-w-xl space-y-4">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.enabled}
          onChange={(e) => setC({ ...c, enabled: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">Starboard włączony</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1 text-sm sm:col-span-1">
          <span className="font-semibold text-white/90">Kanał starboardu</span>
          <ChannelSelect
            value={c.channelId}
            onChange={(v) => setC({ ...c, channelId: v })}
            channels={guild.channels}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Próg reakcji</span>
          <input
            type="number"
            value={c.threshold}
            onChange={(e) => setC({ ...c, threshold: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Emoji</span>
          <input
            value={c.emoji}
            onChange={(e) => setC({ ...c, emoji: e.target.value })}
            placeholder="⭐"
            className={inputCls}
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={st === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {st === 'saving' ? 'Zapisywanie…' : 'Zapisz'}
        </button>
        {st === 'ok' && <span className="text-sm text-green-400">✓ Zapisano</span>}
        {st === 'err' && <span className="text-sm text-accent">Błąd zapisu</span>}
      </div>
    </div>
  );
}
