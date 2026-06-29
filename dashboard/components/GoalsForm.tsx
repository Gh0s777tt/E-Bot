'use client';

import { useState } from 'react';
import type { GoalsConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function GoalsForm({ initial, guild }: { initial: GoalsConfig; guild: GuildMeta }) {
  const { lang } = useLang();
  const [c, setC] = useState<GoalsConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...c, target: Math.max(0, Math.floor(c.target) || 0) }),
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.goals.enabled')}</span>
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
          <span className="font-semibold text-white/90">{tp(lang, 'ui.goals.target')}</span>
          <input
            type="number"
            min={0}
            value={c.target}
            onChange={(e) =>
              setC({ ...c, target: Math.max(0, Math.floor(Number(e.target.value) || 0)) })
            }
            className={inputCls}
          />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.goals.title')}</span>
        <input
          value={c.title}
          onChange={(e) => setC({ ...c, title: e.target.value })}
          maxLength={100}
          className={inputCls}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.goals.reward')}</span>
        <input
          value={c.reward}
          onChange={(e) => setC({ ...c, reward: e.target.value })}
          maxLength={500}
          className={inputCls}
        />
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.goals.help')}</p>
    </div>
  );
}
