'use client';

import { useState } from 'react';
import type { AntiRaidConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
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
  const { lang } = useLang();
  const [c, setC] = useState<AntiRaidConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/antiraid', c);
    setErrMsg(res.error);
    setSt(res.ok ? 'ok' : 'err');
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.security.raidEnabled')}</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.security.joinCount')}</span>
          <input
            type="number"
            value={c.joinCount}
            onChange={(e) => setC({ ...c, joinCount: Math.max(2, num(e.target.value)) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.security.windowSec')}</span>
          <input
            type="number"
            value={c.windowSec}
            onChange={(e) => setC({ ...c, windowSec: Math.max(1, num(e.target.value)) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.security.raidAction')}</span>
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
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.security.minAccountAge')}
          </span>
          <input
            type="number"
            value={c.minAccountAgeDays}
            onChange={(e) => setC({ ...c, minAccountAgeDays: num(e.target.value) })}
            className={inputCls}
          />
        </label>
      </div>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.security.alertChannel')}</span>
        <ChannelSelect
          value={c.alertChannelId}
          onChange={(v) => setC({ ...c, alertChannelId: v })}
          channels={guild.channels}
          placeholder={tp(lang, 'ui.security.noAlerts')}
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
          <span className="font-semibold text-white/90">{tp(lang, 'ui.security.altDetect')}</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">{tp(lang, 'ui.security.altAge')}</span>
            <input
              type="number"
              value={c.altMinAgeDays}
              onChange={(e) => setC({ ...c, altMinAgeDays: num(e.target.value) })}
              className={inputCls}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">{tp(lang, 'ui.security.action')}</span>
            <select
              value={c.altAction}
              onChange={(e) =>
                setC({ ...c, altAction: e.target.value as AntiRaidConfig['altAction'] })
              }
              className={inputCls}
            >
              <option value="alert">{tp(lang, 'ui.security.altAlertOnly')}</option>
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
            <span className="font-semibold text-white/90">
              {tp(lang, 'ui.security.altNoAvatar')}
            </span>
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
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.security.autoLockdown')}
          </span>
          <span className="ms-1 text-muted">{tp(lang, 'ui.security.autoLockdownHelp')}</span>
        </span>
      </label>

      <div className="space-y-4 rounded-lg border border-line/60 bg-elevated/40 p-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.honeypot.enabled}
            onChange={(e) => setC({ ...c, honeypot: { ...c.honeypot, enabled: e.target.checked } })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">🍯 {tp(lang, 'ui.security.honeypot')}</span>
        </label>
        <p className="text-xs text-muted">{tp(lang, 'ui.security.honeypotHelp')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">
              {tp(lang, 'ui.security.honeypotChannel')}
            </span>
            <ChannelSelect
              value={c.honeypot.channelId}
              onChange={(v) => setC({ ...c, honeypot: { ...c.honeypot, channelId: v } })}
              channels={guild.channels}
              placeholder={tp(lang, 'ui.security.noAlerts')}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">{tp(lang, 'ui.security.action')}</span>
            <select
              value={c.honeypot.action}
              onChange={(e) =>
                setC({
                  ...c,
                  honeypot: { ...c.honeypot, action: e.target.value as AntiRaidConfig['action'] },
                })
              }
              className={inputCls}
            >
              {ACTIONS.map((a) => (
                <option key={a.v} value={a.v}>
                  {a.l}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-line/60 bg-elevated/40 p-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.crossIntel.enabled}
            onChange={(e) =>
              setC({ ...c, crossIntel: { ...c.crossIntel, enabled: e.target.checked } })
            }
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">
            🌐 {tp(lang, 'ui.security.crossIntel')}
          </span>
        </label>
        <p className="text-xs text-muted">{tp(lang, 'ui.security.crossIntelHelp')}</p>
        <label className="space-y-1 text-sm sm:max-w-xs">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.security.action')}</span>
          <select
            value={c.crossIntel.action}
            onChange={(e) =>
              setC({
                ...c,
                crossIntel: {
                  ...c.crossIntel,
                  action: e.target.value as AntiRaidConfig['altAction'],
                },
              })
            }
            className={inputCls}
          >
            <option value="alert">{tp(lang, 'ui.security.altAlertOnly')}</option>
            <option value="kick">Kick</option>
            <option value="ban">Ban</option>
            <option value="timeout">Timeout</option>
          </select>
        </label>
      </div>

      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">{tp(lang, 'ui.security.raidFootNote')}</p>
    </div>
  );
}
