'use client';

import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';

type Cfg = {
  autoEvent: boolean;
  eventName: string;
  clipRelay: boolean;
  clipChannelId: string;
  pollMin: number;
};

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));

export default function CreatorForm({ initial, guild }: { initial: Cfg; guild: GuildMeta }) {
  const [c, setC] = useState<Cfg>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...c, pollMin: Math.min(120, Math.max(2, c.pollMin)) }),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Auto-wydarzenie */}
      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.autoEvent}
            onChange={(e) => setC({ ...c, autoEvent: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">
            Auto-wydarzenie Discord przy wejściu na live (Twitch)
          </span>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-semibold text-white/90">Nazwa wydarzenia (szablon)</span>
          <input
            value={c.eventName}
            onChange={(e) => setC({ ...c, eventName: e.target.value })}
            placeholder="🔴 {name} — LIVE"
            className={inputCls}
          />
          <span className="text-xs text-muted">
            <code className="text-accent">{'{name}'}</code> = nick kanału. Pusto → domyślny.
          </span>
        </label>
        <p className="text-xs text-muted">
          Działa przez Twitch EventSub (natychmiast). Bot musi mieć uprawnienie{' '}
          <strong>„Zarządzanie wydarzeniami"</strong>.
        </p>
      </div>

      {/* Relay klipów */}
      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.clipRelay}
            onChange={(e) => setC({ ...c, clipRelay: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">Relay nowych klipów Twitch na Discord</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">Kanał na klipy</span>
            <ChannelSelect
              value={c.clipChannelId}
              onChange={(v) => setC({ ...c, clipChannelId: v })}
              channels={guild.channels}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">Sprawdzaj co (min)</span>
            <input
              type="number"
              value={c.pollMin}
              onChange={(e) => setC({ ...c, pollMin: num(e.target.value) })}
              min={2}
              max={120}
              className={inputCls}
            />
          </label>
        </div>
        <p className="text-xs text-muted">
          Bot (24/7 na Railway) odpytuje Twitch Helix i wrzuca tylko nowe klipy (bez duplikatów).
        </p>
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
