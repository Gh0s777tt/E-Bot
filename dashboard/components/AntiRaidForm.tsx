'use client';

import { useState } from 'react';
import type { AntiRaidConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));

const ACTIONS: { v: AntiRaidConfig['action']; l: string }[] = [
  { v: 'kick', l: 'Kick' },
  { v: 'ban', l: 'Ban' },
  { v: 'timeout', l: 'Timeout (10 min)' },
];

export default function AntiRaidForm({
  initial,
  guild,
}: {
  initial: AntiRaidConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<AntiRaidConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/antiraid', {
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
        <span className="font-semibold text-white/90">Anti-raid włączony</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Próg wejść</span>
          <input
            type="number"
            value={c.joinCount}
            onChange={(e) => setC({ ...c, joinCount: Math.max(2, num(e.target.value)) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">…w oknie (s)</span>
          <input
            type="number"
            value={c.windowSec}
            onChange={(e) => setC({ ...c, windowSec: Math.max(1, num(e.target.value)) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Akcja na falę</span>
          <select
            value={c.action}
            onChange={(e) => setC({ ...c, action: e.target.value as AntiRaidConfig['action'] })}
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
          <span className="font-semibold text-white/90">Min. wiek konta (dni, 0 = off)</span>
          <input
            type="number"
            value={c.minAccountAgeDays}
            onChange={(e) => setC({ ...c, minAccountAgeDays: num(e.target.value) })}
            className={inputCls}
          />
        </label>
      </div>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Kanał alertów</span>
        <ChannelSelect
          value={c.alertChannelId}
          onChange={(v) => setC({ ...c, alertChannelId: v })}
          channels={guild.channels}
          placeholder="— brak alertów —"
        />
      </label>

      <div className="space-y-4 rounded-lg border border-line/60 bg-elevated/40 p-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.altDetect}
            onChange={(e) => setC({ ...c, altDetect: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">
            Wykrywanie altów (podejrzane dołączenia → kanał alertów)
          </span>
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">Podejrzany wiek (dni)</span>
            <input
              type="number"
              value={c.altMinAgeDays}
              onChange={(e) => setC({ ...c, altMinAgeDays: num(e.target.value) })}
              className={inputCls}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">Akcja</span>
            <select
              value={c.altAction}
              onChange={(e) =>
                setC({ ...c, altAction: e.target.value as AntiRaidConfig['altAction'] })
              }
              className={inputCls}
            >
              <option value="alert">Tylko alert</option>
              <option value="kick">Kick</option>
              <option value="ban">Ban</option>
              <option value="timeout">Timeout</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pt-6 text-sm">
            <input
              type="checkbox"
              checked={c.altNoAvatar}
              onChange={(e) => setC({ ...c, altNoAvatar: e.target.checked })}
              className="h-4 w-4 accent-accent"
            />
            <span className="font-semibold text-white/90">Brak avatara = podejrzany</span>
          </label>
        </div>
      </div>

      <label className="flex items-center gap-2.5 rounded-xl border border-line bg-bg/40 p-3 text-sm">
        <input
          type="checkbox"
          checked={c.autoLockdown}
          onChange={(e) => setC({ ...c, autoLockdown: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span>
          <span className="font-semibold text-white/90">🔒 Auto-lockdown przy wykryciu fali</span>
          <span className="ml-1 text-muted">
            — automatycznie blokuje pisanie na całym serwerze (zdejmiesz przez{' '}
            <code>/lockdown off</code>).
          </span>
        </span>
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Gdy w oknie pojawi się ≥ próg wejść, bot wchodzi w tryb obronny i stosuje wybraną akcję do
        całej fali oraz kolejnych wejść (do ~max(okno, 30 s)). „Min. wiek konta" działa też poza
        falą — młodsze konta dostają akcję od razu. Bot potrzebuje uprawnień Kick/Ban/Timeout.
      </p>
    </div>
  );
}
