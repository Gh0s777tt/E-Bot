'use client';

import { useState } from 'react';
import type { VerificationConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
import { RoleSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function VerificationForm({
  initial,
  guild,
}: {
  initial: VerificationConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [c, setC] = useState<VerificationConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/verification', c);
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.security.verifyEnabled')}</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.security.verifyRole')}</span>
        <RoleSelect
          value={c.roleId}
          onChange={(v) => setC({ ...c, roleId: v })}
          roles={guild.roles}
          placeholder={tp(lang, 'ui.security.verifyRolePh')}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.security.panelText')}</span>
        <textarea
          value={c.message}
          onChange={(e) => setC({ ...c, message: e.target.value })}
          rows={3}
          className={inputCls}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.security.buttonLabel')}</span>
        <input
          value={c.buttonLabel}
          onChange={(e) => setC({ ...c, buttonLabel: e.target.value })}
          maxLength={80}
          className={inputCls}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.security.mode')}</span>
          <select
            value={c.mode}
            onChange={(e) => setC({ ...c, mode: e.target.value as VerificationConfig['mode'] })}
            className={inputCls}
          >
            <option value="button">{tp(lang, 'ui.security.modeButton')}</option>
            <option value="captcha">{tp(lang, 'ui.security.modeCaptcha')}</option>
            <option value="phrase">{tp(lang, 'ui.security.modePhrase')}</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.security.minAccountAge')}
          </span>
          <input
            type="number"
            value={c.minAccountAgeDays}
            onChange={(e) =>
              setC({
                ...c,
                minAccountAgeDays: Math.max(0, Math.floor(Number(e.target.value) || 0)),
              })
            }
            className={inputCls}
          />
        </label>
      </div>

      {c.mode === 'phrase' && (
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.security.phrase')}</span>
          <input
            value={c.phrase}
            onChange={(e) => setC({ ...c, phrase: e.target.value })}
            maxLength={100}
            placeholder={tp(lang, 'ui.security.phrasePh')}
            className={inputCls}
          />
          <span className="block text-xs text-muted">{tp(lang, 'ui.security.phraseHelp')}</span>
        </label>
      )}

      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">{tp(lang, 'ui.security.verifyFootNote')}</p>
    </div>
  );
}
