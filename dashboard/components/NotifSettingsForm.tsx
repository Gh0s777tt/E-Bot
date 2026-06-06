'use client';

import { useState } from 'react';

type Settings = {
  notify_channel_id: string;
  notify_mention: string;
  notify_enabled_twitch: boolean;
  notify_enabled_kick: boolean;
  notify_enabled_rumble: boolean;
  notify_enabled_youtube: boolean;
};

const PLATFORMS: { key: keyof Settings; label: string; color: string }[] = [
  { key: 'notify_enabled_twitch', label: 'Twitch', color: '#9146ff' },
  { key: 'notify_enabled_kick', label: 'Kick', color: '#53fc18' },
  { key: 'notify_enabled_rumble', label: 'Rumble', color: '#85c742' },
  { key: 'notify_enabled_youtube', label: 'YouTube (zużywa quota)', color: '#ff0000' },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-white/20'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export default function NotifSettingsForm({ initial }: { initial: Settings }) {
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
        <label className="block text-sm font-semibold text-white/90">ID kanału Discord</label>
        <input
          value={s.notify_channel_id}
          onChange={(e) => set('notify_channel_id', e.target.value)}
          placeholder="np. 123456789012345678"
          className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
        />
        <p className="text-xs text-muted">Discord → tryb dewelopera → PPM na kanale → „Kopiuj ID".</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white/90">Wzmianka (opcjonalnie)</label>
        <input
          value={s.notify_mention}
          onChange={(e) => set('notify_mention', e.target.value)}
          placeholder="@here lub <@&ID_ROLI>"
          className="w-full rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-white/90">Platformy</label>
        {PLATFORMS.map((p) => (
          <div key={p.key} className="flex items-center justify-between rounded-md border border-line bg-card px-4 py-3">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.label}
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
          {status === 'saving' ? 'Zapisywanie…' : 'Zapisz'}
        </button>
        {status === 'saved' && <span className="text-sm text-green-400">✓ Zapisano — bot zastosuje od razu</span>}
        {status === 'error' && <span className="text-sm text-accent">Błąd zapisu</span>}
      </div>
    </div>
  );
}
