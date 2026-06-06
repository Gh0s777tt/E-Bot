'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import type { LoggingConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';

const GROUPS: { key: keyof LoggingConfig; label: string; hint: string }[] = [
  { key: 'messages', label: 'Wiadomości', hint: 'usunięcie · edycja · masowe usunięcie' },
  { key: 'members', label: 'Członkowie', hint: 'dołączenie · wyjście' },
  { key: 'memberUpdates', label: 'Zmiany członków', hint: 'nick · role' },
  { key: 'moderation', label: 'Moderacja', hint: 'ban · unban' },
  { key: 'server', label: 'Serwer', hint: 'kanały · role (utworzenie/usunięcie)' },
  { key: 'voice', label: 'Voice', hint: 'dołączenie · wyjście · przeniesienie' },
];

export default function LoggingForm({
  initial,
  guild,
}: {
  initial: LoggingConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<LoggingConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/logging', {
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

  const chanName = (id: string) => guild.channels.find((x) => x.id === id)?.name ?? id;

  return (
    <div className="max-w-xl space-y-5">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.enabled}
          onChange={(e) => setC({ ...c, enabled: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">Logi serwera włączone</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Kanał logów</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-white/90">Co logować</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {GROUPS.map((g) => (
            <label
              key={g.key}
              className="flex items-start gap-3 rounded-lg border border-line bg-bg/40 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={c[g.key] as boolean}
                onChange={(e) => setC({ ...c, [g.key]: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-accent"
              />
              <span>
                <span className="font-semibold text-white/90">{g.label}</span>
                <span className="block text-xs text-muted">{g.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-white/90">
          Kanały ignorowane (dla zdarzeń wiadomości)
        </span>
        <ChannelSelect
          value=""
          onChange={(v) =>
            v &&
            !c.ignoreChannels.includes(v) &&
            setC({ ...c, ignoreChannels: [...c.ignoreChannels, v] })
          }
          channels={guild.channels}
          placeholder="+ dodaj kanał"
        />
        <div className="flex flex-wrap gap-1.5">
          {c.ignoreChannels.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-elevated px-2.5 py-0.5 text-xs"
            >
              #{chanName(id)}
              <button
                type="button"
                onClick={() =>
                  setC({ ...c, ignoreChannels: c.ignoreChannels.filter((x) => x !== id) })
                }
                className="text-muted hover:text-accent"
                aria-label="Usuń"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
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
        Bot wysyła embed na kanał logów przy każdym zdarzeniu z włączonych grup. Kanał logów i
        kanały ignorowane są pomijane dla zdarzeń wiadomości. Wymaga włączonych intencji (są
        aktywne) — konfigurację bot pobiera na żywo (~30 s).
      </p>
    </div>
  );
}
