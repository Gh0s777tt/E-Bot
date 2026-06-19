'use client';

import { useState } from 'react';
import type { AiDigestConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function AiDigestForm({
  initial,
  guild,
}: {
  initial: AiDigestConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [c, setC] = useState<AiDigestConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/aidigest', {
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.ai.digestEnabledToggle')}</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.ai.sourceChannelLabel')}
          </span>
          <ChannelSelect
            value={c.sourceChannelId}
            onChange={(v) => setC({ ...c, sourceChannelId: v })}
            channels={guild.channels}
            placeholder={tp(lang, 'ui.ai.channelPh')}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.ai.targetChannelLabel')}
          </span>
          <ChannelSelect
            value={c.targetChannelId}
            onChange={(v) => setC({ ...c, targetChannelId: v })}
            channels={guild.channels}
            placeholder={tp(lang, 'ui.ai.channelPh')}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.ai.hourLabel')}</span>
          <input
            type="number"
            min={0}
            max={23}
            value={c.hourUTC}
            onChange={(e) =>
              setC({
                ...c,
                hourUTC: Math.max(0, Math.min(23, Math.floor(Number(e.target.value) || 0))),
              })
            }
            className={inputCls}
          />
        </label>
      </div>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.ai.digestFooter')}</p>
    </div>
  );
}
