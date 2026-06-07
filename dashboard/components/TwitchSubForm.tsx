'use client';

import { useState } from 'react';
import type { TwitchSubConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { RoleSelect } from './pickers';

export default function TwitchSubForm({
  initial,
  guild,
}: {
  initial: TwitchSubConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<TwitchSubConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/twitchsub', {
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
        <span className="font-semibold text-white/90">Rola za subskrypcję Twitch</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Rola dla subskrybentów</span>
        <RoleSelect
          value={c.roleId}
          onChange={(v) => setC({ ...c, roleId: v })}
          roles={guild.roles}
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
        Subskrybent łączy konto komendą <code className="text-accent">/linktwitch</code>, a po
        zasubskrybowaniu bot nada mu tę rolę. <strong>Wymaga jednorazowo:</strong> autoryzacji
        EventSub subskrypcji u twórcy (scope <code>channel:read:subscriptions</code>) — patrz
        podsumowanie.
      </p>
    </div>
  );
}
