'use client';

import { useState } from 'react';
import type { BirthdayConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect, RoleSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function BirthdayForm({
  initial,
  guild,
}: {
  initial: BirthdayConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [c, setC] = useState<BirthdayConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/birthday', {
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.birthdays.enabledLabel')}</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.birthdays.channelLabel')}</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.birthdays.messageLabel')}</span>
        <textarea
          value={c.message}
          onChange={(e) => setC({ ...c, message: e.target.value })}
          rows={2}
          className={inputCls}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.birthdays.roleLabel')}</span>
        <RoleSelect
          value={c.roleId}
          onChange={(v) => setC({ ...c, roleId: v })}
          roles={guild.roles}
          placeholder={tp(lang, 'ui.birthdays.noRole')}
        />
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.birthdays.footNote')}</p>
    </div>
  );
}
