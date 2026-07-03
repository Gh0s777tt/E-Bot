'use client';

import { useState } from 'react';
import type { KofiConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import { useDashboardOrigin } from '../lib/useDashboardOrigin';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function KofiForm({ initial, guild }: { initial: KofiConfig; guild: GuildMeta }) {
  const { lang } = useLang();
  const [c, setC] = useState<KofiConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const WEBHOOK_URL = `${useDashboardOrigin()}/api/kofi`;

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/kofi-config', c);
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.donations.kofiEnabled')}</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.donations.announceChannel')}
        </span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
          placeholder={tp(lang, 'ui.donations.channelPh')}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.donations.verifTokenLabel')}
        </span>
        <input
          value={c.verificationToken}
          onChange={(e) => setC({ ...c, verificationToken: e.target.value })}
          placeholder={tp(lang, 'ui.donations.verifTokenPh')}
          className={inputCls}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.donations.messageLabel')} ({'{name}'} {'{amount}'} {'{currency}'}{' '}
          {'{message}'} {'{type}'})
        </span>
        <textarea
          value={c.message}
          onChange={(e) => setC({ ...c, message: e.target.value })}
          rows={2}
          className={inputCls}
        />
      </label>

      <SaveButton st={st} onClick={save} errorText={errMsg} />

      <div className="rounded-lg border border-line bg-bg/40 p-3 text-xs text-muted">
        <p className="mb-1 font-semibold text-white/90">
          {tp(lang, 'ui.donations.kofiConfigHeading')}
        </p>
        <p>
          Ko-fi → <em>Settings → API / Webhooks</em>
          {tp(lang, 'ui.donations.kofiConfigHelp')}
        </p>
        <code className="mt-1 block break-all rounded bg-elevated px-2 py-1 text-accent">
          {WEBHOOK_URL}
        </code>
      </div>
    </div>
  );
}
