'use client';

import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

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

const PROT_KEYS: Record<string, string> = {
  channelDelete: 'ui.security.protChannelDelete',
  channelCreate: 'ui.security.protChannelCreate',
  roleDelete: 'ui.security.protRoleDelete',
  roleCreate: 'ui.security.protRoleCreate',
  ban: 'ui.security.protBan',
  kick: 'ui.security.protKick',
  webhookCreate: 'ui.security.protWebhookCreate',
  webhookDelete: 'ui.security.protWebhookDelete',
  botAdd: 'ui.security.protBotAdd',
};
const PUNISHMENTS: { v: Config['punishment']; label: string; i18n?: boolean }[] = [
  { v: 'ban', label: 'Ban' },
  { v: 'kick', label: 'Kick' },
  { v: 'timeout', label: 'ui.security.punTimeout', i18n: true },
  { v: 'strip', label: 'ui.security.punStrip', i18n: true },
  { v: 'quarantine', label: 'ui.security.punQuarantine', i18n: true },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-white/20'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'start-[22px]' : 'start-0.5'}`}
      />
    </button>
  );
}

const ids = (s: string) =>
  s
    .split(/[\s,]+/)
    .map((x) => x.trim())
    .filter(Boolean);

export default function AntinukeForm({ initial }: { initial: Config }) {
  const { lang } = useLang();
  const [c, setC] = useState<Config>(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const setProt = (k: string, patch: Partial<Protection>) =>
    setC((p) => ({
      ...p,
      protections: { ...p.protections, [k]: { ...p.protections[k], ...patch } },
    }));

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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-bg/40 p-4">
        <div className="flex items-center gap-3">
          <Toggle on={c.enabled} onClick={() => setC((p) => ({ ...p, enabled: !p.enabled }))} />
          <div>
            <div className="font-semibold">{tp(lang, 'ui.security.nukeTitle')}</div>
            <div className="text-xs text-muted">
              {c.enabled ? tp(lang, 'ui.security.nukeActive') : tp(lang, 'ui.security.nukeOff')}
            </div>
          </div>
        </div>
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="rounded bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {status === 'saving' ? tp(lang, 'ui.saving') : tp(lang, 'ui.save')}
        </button>
      </div>
      {status === 'saved' && (
        <p className="text-sm text-green-400">{tp(lang, 'ui.security.savedLive')}</p>
      )}
      {status === 'error' && <p className="text-sm text-accent">{tp(lang, 'ui.saveError')}</p>}

      {/* ogólne */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.security.logChannelId')}
          </span>
          <input
            value={c.logChannelId}
            onChange={(e) => setC((p) => ({ ...p, logChannelId: e.target.value }))}
            placeholder="123456789012345678"
            className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.security.punishment')}</span>
          <select
            value={c.punishment}
            onChange={(e) =>
              setC((p) => ({ ...p, punishment: e.target.value as Config['punishment'] }))
            }
            className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
          >
            {PUNISHMENTS.map((p) => (
              <option key={p.v} value={p.v}>
                {p.i18n ? tp(lang, p.label) : p.label}
              </option>
            ))}
          </select>
        </label>
        {c.punishment === 'quarantine' && (
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">
              {tp(lang, 'ui.security.quarantineRoleId')}
            </span>
            <input
              value={c.quarantineRoleId}
              onChange={(e) => setC((p) => ({ ...p, quarantineRoleId: e.target.value }))}
              placeholder={tp(lang, 'ui.security.quarantineRolePh')}
              className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
            />
          </label>
        )}
      </div>

      {/* whitelist */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.security.wlUsers')}</span>
          <input
            value={c.whitelistUsers.join(', ')}
            onChange={(e) => setC((p) => ({ ...p, whitelistUsers: ids(e.target.value) }))}
            placeholder={tp(lang, 'ui.security.wlUsersPh')}
            className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.security.wlRoles')}</span>
          <input
            value={c.whitelistRoles.join(', ')}
            onChange={(e) => setC((p) => ({ ...p, whitelistRoles: ids(e.target.value) }))}
            placeholder={tp(lang, 'ui.security.wlRolesPh')}
            className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
          />
        </label>
      </div>

      {/* ochrony */}
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ShieldAlert size={16} className="text-accent" /> {tp(lang, 'ui.security.protections')}
        </h2>
        <div className="space-y-2">
          {Object.keys(PROT_KEYS).map((k) => {
            const p = c.protections[k] ?? { enabled: false, count: 3, windowSec: 10 };
            return (
              <div
                key={k}
                className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-bg/40 px-4 py-3"
              >
                <Toggle on={p.enabled} onClick={() => setProt(k, { enabled: !p.enabled })} />
                <span className="min-w-[160px] flex-1 text-sm">{tp(lang, PROT_KEYS[k])}</span>
                <label className="flex items-center gap-1 text-xs text-muted">
                  {tp(lang, 'ui.security.protActions')}
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
                  {tp(lang, 'ui.security.protPerSec')}
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
