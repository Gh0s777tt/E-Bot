'use client';

import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';

type Settings = {
  notify_channel_id: string;
  notify_mention: string;
  notify_enabled_twitch: boolean;
  notify_enabled_kick: boolean;
  notify_enabled_rumble: boolean;
  notify_enabled_youtube: boolean;
  notify_message: string;
  notify_title: string;
};

// Nazwy platform = marki; przy YouTube dochodzi przetłumaczony dopisek o quocie (ui.notify.youtubeQuota).
const PLATFORMS: { key: keyof Settings; label: string; color: string; quota?: boolean }[] = [
  { key: 'notify_enabled_twitch', label: 'Twitch', color: '#9146ff' },
  { key: 'notify_enabled_kick', label: 'Kick', color: '#53fc18' },
  { key: 'notify_enabled_rumble', label: 'Rumble', color: '#85c742' },
  { key: 'notify_enabled_youtube', label: 'YouTube', color: '#ff0000', quota: true },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-white/20'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'start-[22px]' : 'start-0.5'}`}
      />
    </button>
  );
}

export default function NotifSettingsForm({
  initial,
  guild,
}: {
  initial: Settings;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [s, setS] = useState<Settings>(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS((p) => ({ ...p, [k]: v }));
  }

  async function save() {
    setStatus('saving');
    try {
      const r = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      setStatus(r.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 2500);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white/90">
          {tp(lang, 'ui.notify.channelLabel')}
        </label>
        <ChannelSelect
          value={s.notify_channel_id}
          onChange={(v) => set('notify_channel_id', v)}
          channels={guild.channels}
        />
        <p className="text-xs text-muted">{tp(lang, 'ui.notify.channelHelp')}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white/90">
          {tp(lang, 'ui.notify.mentionLabel')}
        </label>
        <input
          value={s.notify_mention}
          onChange={(e) => set('notify_mention', e.target.value)}
          placeholder={tp(lang, 'ui.notify.mentionPlaceholder')}
          className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white/90">
          {tp(lang, 'ui.notify.messageLabel')}
        </label>
        <textarea
          value={s.notify_message}
          onChange={(e) => set('notify_message', e.target.value)}
          rows={2}
          className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white/90">
          {tp(lang, 'ui.notify.titleLabel')}
        </label>
        <input
          value={s.notify_title}
          onChange={(e) => set('notify_title', e.target.value)}
          className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-white/90">
          {tp(lang, 'ui.notify.platforms')}
        </label>
        {PLATFORMS.map((p) => (
          <div
            key={p.key}
            className="flex items-center justify-between rounded-md border border-line bg-bg/40 px-4 py-3"
          >
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.quota ? `${p.label} ${tp(lang, 'ui.notify.youtubeQuota')}` : p.label}
            </span>
            <Toggle on={s[p.key] as boolean} onClick={() => set(p.key, !s[p.key] as never)} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="rounded bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {status === 'saving' ? tp(lang, 'ui.saving') : tp(lang, 'ui.save')}
        </button>
        {status === 'saved' && (
          <span className="text-sm text-green-400">{tp(lang, 'ui.saved')}</span>
        )}
        {status === 'error' && (
          <span className="text-sm text-accent">{tp(lang, 'ui.saveError')}</span>
        )}
      </div>
    </div>
  );
}
