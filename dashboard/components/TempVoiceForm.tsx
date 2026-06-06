'use client';

import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';

type Cfg = { enabled: boolean; hubChannelId: string; categoryId: string; nameTemplate: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function TempVoiceForm({ initial, guild }: { initial: Cfg; guild: GuildMeta }) {
  const [c, setC] = useState<Cfg>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/tempvoice', {
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
        <span className="font-semibold text-white/90">Kanały głosowe na żądanie włączone</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał „hub" (wejście tworzy kanał)</span>
          <ChannelSelect
            value={c.hubChannelId}
            onChange={(v) => setC({ ...c, hubChannelId: v })}
            channels={guild.channels}
            kind="voice"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kategoria nowych kanałów</span>
          <ChannelSelect
            value={c.categoryId}
            onChange={(v) => setC({ ...c, categoryId: v })}
            channels={guild.channels}
            kind="category"
            placeholder="— ta sama co hub —"
          />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">Szablon nazwy</span>
        <input
          value={c.nameTemplate}
          onChange={(e) => setC({ ...c, nameTemplate: e.target.value })}
          placeholder="🔊 {user}"
          className={inputCls}
        />
        <span className="text-xs text-muted">
          <code className="text-accent">{'{user}'}</code> = nick osoby tworzącej kanał.
        </span>
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
    </div>
  );
}
