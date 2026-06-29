'use client';

import { useState } from 'react';
import type { MilestonesConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function MilestonesForm({
  initial,
  guild,
}: {
  initial: MilestonesConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [c, setC] = useState<MilestonesConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...c, every: Math.max(2, Math.floor(c.every) || 2) }),
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.milestones.enabled')}</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.gaming.channelAnnounce')}
          </span>
          <ChannelSelect
            value={c.channelId}
            onChange={(v) => setC({ ...c, channelId: v })}
            channels={guild.channels}
            placeholder={tp(lang, 'ui.gaming.channelPh')}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.milestones.every')}</span>
          <input
            type="number"
            min={2}
            value={c.every}
            onChange={(e) =>
              setC({ ...c, every: Math.max(0, Math.floor(Number(e.target.value) || 0)) })
            }
            className={inputCls}
          />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.milestones.message')}</span>
        <textarea
          value={c.message}
          onChange={(e) => setC({ ...c, message: e.target.value })}
          rows={2}
          maxLength={2000}
          className={inputCls}
        />
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.milestones.help')}</p>
    </div>
  );
}
