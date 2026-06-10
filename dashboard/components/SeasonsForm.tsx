'use client';

import { useState } from 'react';
import type { SeasonsConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function SeasonsForm({
  initial,
  guild,
}: {
  initial: SeasonsConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<SeasonsConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/seasons', {
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
        <span className="font-semibold text-white/90">Sezonowe rankingi włączone</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał ogłoszeń (hall of fame)</span>
          <ChannelSelect
            value={c.channelId}
            onChange={(v) => setC({ ...c, channelId: v })}
            channels={guild.channels}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Ilu w hall of fame (1–25)</span>
          <input
            type="number"
            value={c.top}
            onChange={(e) =>
              setC({
                ...c,
                top: Math.max(1, Math.min(25, Math.floor(Number(e.target.value) || 10))),
              })
            }
            className={inputCls}
          />
        </label>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.reset}
          onChange={(e) => setC({ ...c, reset: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-accent"
        />
        <span>
          <span className="font-semibold text-white/90">Reset XP po sezonie</span>
          <span className="block text-xs text-accent">
            ⚠️ Zeruje XP i poziomy wszystkich po archiwizacji miesiąca (prestiż zostaje). Bez tego
            hall of fame zapisuje aktualny ranking co miesiąc, ale XP rośnie dalej.
          </span>
        </span>
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Na przełomie miesiąca bot zapisuje top XP do hall of fame, ogłasza na kanale i (opcjonalnie)
        resetuje sezon. Podgląd: komenda <code className="text-accent">/hof</code>. Wymaga{' '}
        <code>_ALL.sql</code> w Supabase.
      </p>
    </div>
  );
}
