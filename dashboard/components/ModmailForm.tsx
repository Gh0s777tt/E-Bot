'use client';

import { useState } from 'react';
import type { ModmailConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function ModmailForm({
  initial,
  guild,
}: {
  initial: ModmailConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<ModmailConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/modmail', {
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
        <span className="font-semibold text-white/90">Modmail włączony</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Kanał obsługi (wątki modmaila)</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          Powitanie w DM (przy pierwszym kontakcie)
        </span>
        <textarea
          value={c.greeting}
          onChange={(e) => setC({ ...c, greeting: e.target.value })}
          rows={3}
          className={inputCls}
        />
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Użytkownik pisze <strong>DM do bota</strong> → bot tworzy wątek na kanale obsługi i
        przekazuje wiadomość. Odpowiedź obsługi <strong>w wątku</strong> trafia w DM użytkownika;{' '}
        <code>!close</code> zamyka rozmowę. Wymaga uruchomienia <code>f6-modmail-schema.sql</code> w
        Supabase (kanał musi być tekstowy — bot tworzy w nim wątki).
      </p>
    </div>
  );
}
