'use client';

import { useState } from 'react';
import type { FreeGamesConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

export default function FreeGamesForm({
  initial,
  guild,
}: {
  initial: FreeGamesConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [c, setC] = useState<FreeGamesConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/freegames', c);
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.gaming.freeEnabled')}</span>
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.gaming.channelAnnounce')}</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
          placeholder={tp(lang, 'ui.gaming.channelPh')}
        />
      </label>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={!!c.multiStore}
          onChange={(e) => setC({ ...c, multiStore: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">{tp(lang, 'ui.gaming.multiStore')}</span>
      </label>
      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">{tp(lang, 'ui.gaming.freeHelp')}</p>
    </div>
  );
}
