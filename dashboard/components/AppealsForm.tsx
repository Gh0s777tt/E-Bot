'use client';

import { useEffect, useState } from 'react';
import type { AppealsConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

export default function AppealsForm({
  initial,
  guild,
  guildId,
}: {
  initial: AppealsConfig;
  guild: GuildMeta;
  guildId: string;
}) {
  const { lang } = useLang();
  const [c, setC] = useState<AppealsConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  // Link składamy po stronie klienta (origin), żeby uniknąć niezgodności hydratacji.
  const [link, setLink] = useState(guildId ? `/p/appeal?g=${guildId}` : '');
  useEffect(() => {
    if (guildId) setLink(`${window.location.origin}/p/appeal?g=${guildId}`);
  }, [guildId]);

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/appeals-config', {
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.appeals.enabled')}</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.appeals.channel')}</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
          placeholder={tp(lang, 'ui.gaming.channelPh')}
        />
      </label>

      {guildId && (
        <div className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.appeals.linkLabel')}</span>
          <code className="block break-all rounded-md border border-line bg-elevated px-3 py-2 text-accent text-xs">
            {link}
          </code>
        </div>
      )}

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.appeals.help')}</p>
    </div>
  );
}
