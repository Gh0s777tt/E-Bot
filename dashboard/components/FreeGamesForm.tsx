'use client';

import { useState } from 'react';
import type { FreeGamesConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

export default function FreeGamesForm({
  initial,
  guild,
}: {
  initial: FreeGamesConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<FreeGamesConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/freegames', {
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
        <span className="font-semibold text-white/90">Feed darmowych gier (Epic) włączony</span>
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Kanał ogłoszeń</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
        />
      </label>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={!!c.multiStore}
          onChange={(e) => setC({ ...c, multiStore: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">
          Multi-store (Steam / GOG / … przez ITAD — wymaga klucza ITAD)
        </span>
      </label>
      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Bot co ~6 h sprawdza darmowe gry w Epic Games Store (publiczne API, bez klucza) i ogłasza
        nowe na wybranym kanale. Z opcją <strong>multi-store</strong> dochodzą darmowe rozdania
        (−100%) z innych sklepów (Steam/GOG/…) przez ITAD.
      </p>
    </div>
  );
}
