'use client';

import { useState } from 'react';
import type { DigestConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

export default function DigestForm({
  initial,
  guild,
}: {
  initial: DigestConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<DigestConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/digest', {
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
        <span className="font-semibold text-white/90">Tygodniowy digest włączony</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Kanał podsumowań</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
          placeholder="— wybierz kanał —"
        />
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        W każdy poniedziałek bot wysyła na wybrany kanał podsumowanie tygodnia (wiadomości, minuty
        voice, wzrost serwera) z danych <code>activity_daily</code>.
      </p>
    </div>
  );
}
