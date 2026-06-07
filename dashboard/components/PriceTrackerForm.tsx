'use client';

import { useState } from 'react';
import type { PriceTrackerConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';

export default function PriceTrackerForm({
  initial,
  guild,
}: {
  initial: PriceTrackerConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<PriceTrackerConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/pricetracker', {
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
        <span className="font-semibold text-white/90">Śledzenie cen (ITAD) włączone</span>
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Kanał alertów o promocjach</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
        />
      </label>
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
        Bot co ~12 h sprawdza w IsThereAnyDeal ceny gier z <strong>Listy życzeń</strong> i ogłasza
        nowe promocje (z najniższą ceną i sklepem). Wymaga klucza <code>ITAD_API_KEY</code> po
        stronie bota (skonfigurowany) oraz uruchomionego <code>_ALL.sql</code> (tabela{' '}
        <code>wishlist</code>).
      </p>
    </div>
  );
}
