'use client';

import { useState } from 'react';
import type { AiModConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect, RoleSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

const ACTIONS: { v: AiModConfig['action']; l: string }[] = [
  { v: 'delete', l: 'Usuń wiadomość' },
  { v: 'warn', l: 'Ostrzeż (bez usuwania)' },
  { v: 'log', l: 'Tylko loguj' },
];

export default function AiModForm({ initial, guild }: { initial: AiModConfig; guild: GuildMeta }) {
  const [c, setC] = useState<AiModConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/aimod', {
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
        <span className="font-semibold text-white/90">AI-moderacja włączona</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Akcja po wykryciu</span>
          <select
            value={c.action}
            onChange={(e) => setC({ ...c, action: e.target.value as AiModConfig['action'] })}
            className={inputCls}
          >
            {ACTIONS.map((a) => (
              <option key={a.v} value={a.v}>
                {a.l}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał logów</span>
          <ChannelSelect
            value={c.logChannelId}
            onChange={(v) => setC({ ...c, logChannelId: v })}
            channels={guild.channels}
            placeholder="— brak —"
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-semibold text-white/90">Rola zwolniona</span>
          <RoleSelect
            value={c.exemptRoleId}
            onChange={(v) => setC({ ...c, exemptRoleId: v })}
            roles={guild.roles}
            placeholder="— brak —"
          />
        </label>
      </div>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Skanuje wiadomości <strong>darmowym</strong> endpointem moderacji OpenAI (toksyczność,
        nękanie, treści NSFW, przemoc itp.) i stosuje wybraną akcję. Pomija moderatorów (uprawnienie
        „Zarządzanie wiadomościami") i rolę zwolnioną. Wymaga <code>OPENAI_API_KEY</code> (jest w
        .env). Najlepsze dla mniejszych serwerów (wywołanie API na wiadomość).
      </p>
    </div>
  );
}
