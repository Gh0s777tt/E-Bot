'use client';

import { useState } from 'react';
import type { AiHelpConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function AiHelpForm({
  initial,
  guild,
}: {
  initial: AiHelpConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<AiHelpConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/aihelp', {
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
        <span className="font-semibold text-white/90">AI-pomoc włączona</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Kanał pomocy</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
          placeholder="— wybierz kanał —"
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Baza wiedzy (FAQ / regulamin)</span>
        <textarea
          value={c.knowledge}
          onChange={(e) => setC({ ...c, knowledge: e.target.value })}
          rows={8}
          maxLength={6000}
          placeholder="Wklej FAQ, zasady, najczęstsze pytania… Bot odpowiada WYŁĄCZNIE na podstawie tej wiedzy."
          className={inputCls}
        />
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Na wybranym kanale bot odpowiada na pytania (≥6 znaków) wyłącznie na podstawie bazy wiedzy
        (bez zmyślania). Wymaga włączonych <code className="text-accent">Komend AI</code> powyżej.
        Limit 10 s/użytkownik.
      </p>
    </div>
  );
}
