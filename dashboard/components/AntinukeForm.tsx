'use client';

import { useState } from 'react';

type Protection = { enabled: boolean; count: number; windowSec: number };
type Config = {
  enabled: boolean;
  logChannelId: string;
  punishment: 'ban' | 'kick' | 'timeout' | 'strip' | 'quarantine';
  quarantineRoleId: string;
  whitelistUsers: string[];
  whitelistRoles: string[];
  protections: Record<string, Protection>;
};

const PROT_LABELS: Record<string, string> = {
  channelDelete: 'Usuwanie kanałów',
  channelCreate: 'Tworzenie kanałów',
  roleDelete: 'Usuwanie ról',
  roleCreate: 'Tworzenie ról',
  ban: 'Masowe bany',
  kick: 'Masowe kicki',
  webhookCreate: 'Tworzenie webhooków',
  webhookDelete: 'Usuwanie webhooków',
  botAdd: 'Dodawanie botów',
};
const PUNISHMENTS: { v: Config['punishment']; l: string }[] = [
  { v: 'ban', l: 'Ban' },
  { v: 'kick', l: 'Kick' },
  { v: 'timeout', l: 'Timeout (7 dni)' },
  { v: 'strip', l: 'Odebranie ról' },
  { v: 'quarantine', l: 'Kwarantanna' },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-white/20'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

const ids = (s: string) => s.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);

export default function AntinukeForm({ initial }: { initial: Config }) {
  const [c, setC] = useState<Config>(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const setProt = (k: string, patch: Partial<Protection>) =>
    setC((p) => ({ ...p, protections: { ...p.protections, [k]: { ...p.protections[k], ...patch } } }));

  async function save() {
    setStatus('saving');
    try {
      const r = await fetch('/api/antinuke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
      setStatus(r.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 2500);
  }

  return (
    <div className="space-y-6">
      {/* górny pasek: włącznik + zapis */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-card p-4">
        <div className="flex items-center gap-3">
          <Toggle on={c.enabled} onClick={() => setC((p) => ({ ...p, enabled: !p.enabled }))} />
          <div>
            <div className="font-semibold">System Anti-Nuke</div>
            <div className="text-xs text-muted">{c.enabled ? 'Aktywny — chroni serwer' : 'Wyłączony'}</div>
          </div>
        </div>
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="rounded bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {status === 'saving' ? 'Zapisywanie…' : 'Zapisz'}
        </button>
      </div>
      {status === 'saved' && <p className="text-sm text-green-400">✓ Zapisano — bot zastosuje w ciągu ~15 s</p>}
      {status === 'error' && <p className="text-sm text-accent">Błąd zapisu</p>}

      {/* ogólne */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">ID kanału logów</span>
          <input
            value={c.logChannelId}
            onChange={(e) => setC((p) => ({ ...p, logChannelId: e.target.value }))}
            placeholder="123456789012345678"
            className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kara</span>
          <select
            value={c.punishment}
            onChange={(e) => setC((p) => ({ ...p, punishment: e.target.value as Config['punishment'] }))}
            className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
          >
            {PUNISHMENTS.map((p) => (
              <option key={p.v} value={p.v}>{p.l}</option>
            ))}
          </select>
        </label>
        {c.punishment === 'quarantine' && (
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">ID roli kwarantanny</span>
            <input
              value={c.quarantineRoleId}
              onChange={(e) => setC((p) => ({ ...p, quarantineRoleId: e.target.value }))}
              placeholder="ID roli nadawanej sprawcy"
              className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
            />
          </label>
        )}
      </div>

      {/* whitelist */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Whitelist — użytkownicy (ID, po przecinku)</span>
          <input
            value={c.whitelistUsers.join(', ')}
            onChange={(e) => setC((p) => ({ ...p, whitelistUsers: ids(e.target.value) }))}
            placeholder="np. 1345..., 9876..."
            className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Whitelist — role (ID, po przecinku)</span>
          <input
            value={c.whitelistRoles.join(', ')}
            onChange={(e) => setC((p) => ({ ...p, whitelistRoles: ids(e.target.value) }))}
            placeholder="ID ról zaufanych"
            className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
          />
        </label>
      </div>

      {/* ochrony */}
      <div>
        <h2 className="mb-2 text-lg font-semibold">Ochrony</h2>
        <div className="space-y-2">
          {Object.keys(PROT_LABELS).map((k) => {
            const p = c.protections[k] ?? { enabled: false, count: 3, windowSec: 10 };
            return (
              <div key={k} className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-card px-4 py-3">
                <Toggle on={p.enabled} onClick={() => setProt(k, { enabled: !p.enabled })} />
                <span className="min-w-[160px] flex-1 text-sm">{PROT_LABELS[k]}</span>
                <label className="flex items-center gap-1 text-xs text-muted">
                  akcji
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={p.count}
                    onChange={(e) => setProt(k, { count: Number(e.target.value) || 1 })}
                    className="w-16 rounded border border-line bg-elevated px-2 py-1 text-white"
                  />
                </label>
                <label className="flex items-center gap-1 text-xs text-muted">
                  / sek.
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={p.windowSec}
                    onChange={(e) => setProt(k, { windowSec: Number(e.target.value) || 1 })}
                    className="w-16 rounded border border-line bg-elevated px-2 py-1 text-white"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
