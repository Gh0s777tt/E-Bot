'use client';

import { useState } from 'react';
import type { AiModConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect, RoleSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

const ACTIONS: { v: AiModConfig['action']; k: string }[] = [
  { v: 'delete', k: 'ui.mod.actDelete' },
  { v: 'warn', k: 'ui.mod.aiActWarn' },
  { v: 'log', k: 'ui.mod.aiActLog' },
];

export default function AiModForm({ initial, guild }: { initial: AiModConfig; guild: GuildMeta }) {
  const { lang } = useLang();
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.aiEnabledToggle')}</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.aiActionLabel')}</span>
          <select
            value={c.action}
            onChange={(e) => setC({ ...c, action: e.target.value as AiModConfig['action'] })}
            className={inputCls}
          >
            {ACTIONS.map((a) => (
              <option key={a.v} value={a.v}>
                {tp(lang, a.k)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.aiLogChannel')}</span>
          <ChannelSelect
            value={c.logChannelId}
            onChange={(v) => setC({ ...c, logChannelId: v })}
            channels={guild.channels}
            placeholder={tp(lang, 'ui.mod.none')}
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.aiExemptRole')}</span>
          <RoleSelect
            value={c.exemptRoleId}
            onChange={(v) => setC({ ...c, exemptRoleId: v })}
            roles={guild.roles}
            placeholder={tp(lang, 'ui.mod.none')}
          />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.scanImages}
          onChange={(e) => setC({ ...c, scanImages: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.aiScanImages')}</span>
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        {tp(lang, 'ui.mod.aiFooterPre')} <strong>{tp(lang, 'ui.mod.aiFooterStrong')}</strong>{' '}
        {tp(lang, 'ui.mod.aiFooterMid')} <code>OPENAI_API_KEY</code>{' '}
        {tp(lang, 'ui.mod.aiFooterPost')}
      </p>
    </div>
  );
}
