'use client';

import { useState } from 'react';

type Cfg = {
  enabled: boolean;
  blockInvites: boolean;
  blockLinks: boolean;
  maxMentions: number;
  antiSpamCount: number;
  antiSpamSec: number;
  modlogChannelId: string;
  exemptRoleId: string;
};

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));

export default function AutomodForm({ initial }: { initial: Cfg }) {
  const [c, setC] = useState<Cfg>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/automod', {
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

  const toggle = (k: keyof Cfg, label: string) => (
    <label className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={c[k] as boolean}
        onChange={(e) => setC({ ...c, [k]: e.target.checked })}
        className="h-4 w-4 accent-accent"
      />
      <span className="font-semibold text-white/90">{label}</span>
    </label>
  );

  return (
    <div className="max-w-xl space-y-4">
      {toggle('enabled', 'Automod włączony')}
      <div className="grid gap-2 sm:grid-cols-2">
        {toggle('blockInvites', 'Blokuj zaproszenia Discord')}
        {toggle('blockLinks', 'Blokuj linki (http/https)')}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Maks. wzmianek / wiadomość</span>
          <input
            type="number"
            value={c.maxMentions}
            onChange={(e) => setC({ ...c, maxMentions: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Anty-spam: wiadomości</span>
          <input
            type="number"
            value={c.antiSpamCount}
            onChange={(e) => setC({ ...c, antiSpamCount: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">…w ciągu (s)</span>
          <input
            type="number"
            value={c.antiSpamSec}
            onChange={(e) => setC({ ...c, antiSpamSec: Math.max(1, num(e.target.value)) })}
            className={inputCls}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał mod-log (ID)</span>
          <input
            value={c.modlogChannelId}
            onChange={(e) => setC({ ...c, modlogChannelId: e.target.value })}
            placeholder="ID kanału logów"
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Rola zwolniona z automodu (ID)</span>
          <input
            value={c.exemptRoleId}
            onChange={(e) => setC({ ...c, exemptRoleId: e.target.value })}
            placeholder="ID roli (opcjonalnie)"
            className={inputCls}
          />
        </label>
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
        Bot usuwa naruszenia + loguje na mod-log. Użytkownicy z uprawnieniem „Zarządzanie
        wiadomościami" i rolą zwolnioną są pomijani. Wymaga włączonych intencji (są aktywne).
      </p>
    </div>
  );
}
