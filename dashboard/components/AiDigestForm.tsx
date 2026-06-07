'use client';

import { useState } from 'react';
import type { AiDigestConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function AiDigestForm({
  initial,
  guild,
}: {
  initial: AiDigestConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<AiDigestConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/aidigest', {
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
        <span className="font-semibold text-white/90">Dzienny AI-digest włączony</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał źródłowy (co streszczać)</span>
          <ChannelSelect
            value={c.sourceChannelId}
            onChange={(v) => setC({ ...c, sourceChannelId: v })}
            channels={guild.channels}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał docelowy (gdzie wysłać)</span>
          <ChannelSelect
            value={c.targetChannelId}
            onChange={(v) => setC({ ...c, targetChannelId: v })}
            channels={guild.channels}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Godzina (UTC, 0–23)</span>
          <input
            type="number"
            min={0}
            max={23}
            value={c.hourUTC}
            onChange={(e) =>
              setC({
                ...c,
                hourUTC: Math.max(0, Math.min(23, Math.floor(Number(e.target.value) || 0))),
              })
            }
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
      <p className="text-xs text-muted">
        Raz dziennie (o wybranej godzinie UTC) bot streszcza ostatnie ~80 wiadomości kanału
        źródłowego i wysyła podsumowanie na docelowy. Wymaga włączonych Komend AI.
      </p>
    </div>
  );
}
