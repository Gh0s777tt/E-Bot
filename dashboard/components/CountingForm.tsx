'use client';

import { useState } from 'react';
import type { CountingConfig } from '../lib/engagement';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

export default function CountingForm({
  initial,
  guild,
}: {
  initial: CountingConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [c, setC] = useState<CountingConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/counting', {
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
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.engagement.ct.enabledToggle')}
        </span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.engagement.ct.channelLabel')}
        </span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
          placeholder={tp(lang, 'ui.engagement.ct.channelPh')}
        />
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.allowSameUser}
          onChange={(e) => setC({ ...c, allowSameUser: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.engagement.ct.allowSameUser')}
        </span>
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.resetOnFail}
          onChange={(e) => setC({ ...c, resetOnFail: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.engagement.ct.resetOnFail')}
        </span>
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.engagement.ct.footer')}</p>
    </div>
  );
}
