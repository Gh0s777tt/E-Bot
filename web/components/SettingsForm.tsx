'use client';

import { useState } from 'react';
import { useT } from './LangProvider';

type Settings = {
  notify_channel_id: string;
  notify_mention: string;
  notify_enabled_twitch: boolean;
  notify_enabled_kick: boolean;
  notify_enabled_rumble: boolean;
  notify_enabled_youtube: boolean;
};

// Nazwy platform = marki (nie tłumaczone); przy YouTube dochodzi przetłumaczony dopisek o quocie.
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
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-white/20'}`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}

export default function SettingsForm({ initial }: { initial: Settings }) {
  const tt = useT();
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
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white/90">
          {tt('form.channelLabel')}
        </label>
        <input
          value={s.notify_channel_id}
          onChange={(e) => set('notify_channel_id', e.target.value)}
          placeholder={tt('form.channelPlaceholder')}
          className="w-full rounded-md border border-white/15 bg-elevated px-3 py-2 text-white outline-none focus:border-accent"
        />
        <p className="text-xs text-muted">{tt('form.channelHelp')}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white/90">
          {tt('form.mentionLabel')}
        </label>
        <input
          value={s.notify_mention}
          onChange={(e) => set('notify_mention', e.target.value)}
          placeholder={tt('form.mentionPlaceholder')}
          className="w-full rounded-md border border-white/15 bg-elevated px-3 py-2 text-white outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-white/90">{tt('form.platforms')}</label>
        {PLATFORMS.map((p) => (
          <div
            key={p.key}
            className="flex items-center justify-between rounded-md bg-surface px-4 py-3"
          >
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.quota ? `${p.label} ${tt('form.youtubeQuota')}` : p.label}
            </span>
            <Toggle on={s[p.key] as boolean} onClick={() => set(p.key, !s[p.key] as never)} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="rounded bg-accent px-6 py-2.5 font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {status === 'saving' ? tt('form.saving') : tt('form.save')}
        </button>
        {status === 'saved' && <span className="text-sm text-green-400">✓ {tt('form.saved')}</span>}
        {status === 'error' && <span className="text-sm text-accent">{tt('form.error')}</span>}
      </div>
    </div>
  );
}
