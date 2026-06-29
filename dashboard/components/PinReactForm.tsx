'use client';

import { useState } from 'react';
import type { PinreactConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { RoleSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function PinReactForm({
  initial,
  guild,
}: {
  initial: PinreactConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [emoji, setEmoji] = useState(initial.emoji || '📌');
  const [roleId, setRoleId] = useState(initial.roleId);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/pinreact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, emoji: (emoji || '📌').slice(0, 64), roleId }),
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
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">{tp(lang, 'ui.pinreact.enabled')}</span>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.pinreact.emoji')}</span>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={64}
            placeholder="📌"
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.pinreact.role')}</span>
          <RoleSelect
            value={roleId}
            onChange={setRoleId}
            roles={guild.roles}
            placeholder={tp(lang, 'ui.sticky.rolePh')}
          />
        </label>
      </div>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.pinreact.help')}</p>
    </div>
  );
}
