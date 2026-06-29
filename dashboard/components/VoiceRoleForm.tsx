'use client';

import { useState } from 'react';
import type { VoiceroleConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { RoleSelect } from './pickers';
import SaveButton from './SaveButton';

export default function VoiceRoleForm({
  initial,
  guild,
}: {
  initial: VoiceroleConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [roleId, setRoleId] = useState(initial.roleId);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/voicerole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, roleId }),
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.voicerole.enabled')}</span>
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.voicerole.role')}</span>
        <RoleSelect
          value={roleId}
          onChange={setRoleId}
          roles={guild.roles}
          placeholder={tp(lang, 'ui.sticky.rolePh')}
        />
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.voicerole.help')}</p>
    </div>
  );
}
