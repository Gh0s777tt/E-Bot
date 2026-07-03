'use client';

import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

type Cfg = {
  autoEvent: boolean;
  eventName: string;
  clipRelay: boolean;
  clipChannelId: string;
  pollMin: number;
};

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));

export default function CreatorForm({ initial, guild }: { initial: Cfg; guild: GuildMeta }) {
  const { lang } = useLang();
  const [c, setC] = useState<Cfg>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/creator', {
      ...c,
      pollMin: Math.min(120, Math.max(2, c.pollMin)),
    });
    setErrMsg(res.error);
    setSt(res.ok ? 'ok' : 'err');
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Auto-wydarzenie */}
      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.autoEvent}
            onChange={(e) => setC({ ...c, autoEvent: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.creator.autoEventToggle')}
          </span>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.creator.eventNameLabel')}
          </span>
          <input
            value={c.eventName}
            onChange={(e) => setC({ ...c, eventName: e.target.value })}
            placeholder="🔴 {name} — LIVE"
            className={inputCls}
          />
          <span className="text-xs text-muted">
            <code className="text-accent">{'{name}'}</code>
            {tp(lang, 'ui.creator.eventNameHint')}
          </span>
        </label>
        <p className="text-xs text-muted">{tp(lang, 'ui.creator.autoEventHelp')}</p>
      </div>

      {/* Relay klipów */}
      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.clipRelay}
            onChange={(e) => setC({ ...c, clipRelay: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.creator.clipRelayToggle')}
          </span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">
              {tp(lang, 'ui.creator.clipChannelLabel')}
            </span>
            <ChannelSelect
              value={c.clipChannelId}
              onChange={(v) => setC({ ...c, clipChannelId: v })}
              channels={guild.channels}
              placeholder={tp(lang, 'ui.creator.channelPh')}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">{tp(lang, 'ui.creator.pollLabel')}</span>
            <input
              type="number"
              value={c.pollMin}
              onChange={(e) => setC({ ...c, pollMin: num(e.target.value) })}
              min={2}
              max={120}
              className={inputCls}
            />
          </label>
        </div>
        <p className="text-xs text-muted">{tp(lang, 'ui.creator.clipHelp')}</p>
      </div>

      <SaveButton st={st} onClick={save} errorText={errMsg} />
    </div>
  );
}
