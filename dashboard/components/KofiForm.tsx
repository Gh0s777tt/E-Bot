'use client';

import { useState } from 'react';
import type { KofiConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const WEBHOOK_URL = 'https://e-bot-dc.vercel.app/api/kofi';

export default function KofiForm({ initial, guild }: { initial: KofiConfig; guild: GuildMeta }) {
  const [c, setC] = useState<KofiConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/kofi-config', {
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
        <span className="font-semibold text-white/90">Donejty Ko-fi włączone</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Kanał ogłoszeń</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Verification token (z panelu Ko-fi)</span>
        <input
          value={c.verificationToken}
          onChange={(e) => setC({ ...c, verificationToken: e.target.value })}
          placeholder="wklej z Ko-fi → Settings → API/Webhooks"
          className={inputCls}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          Wiadomość ({'{name}'} {'{amount}'} {'{currency}'} {'{message}'} {'{type}'})
        </span>
        <textarea
          value={c.message}
          onChange={(e) => setC({ ...c, message: e.target.value })}
          rows={2}
          className={inputCls}
        />
      </label>

      <SaveButton st={st} onClick={save} />

      <div className="rounded-lg border border-line bg-bg/40 p-3 text-xs text-muted">
        <p className="mb-1 font-semibold text-white/90">Konfiguracja w Ko-fi:</p>
        <p>
          Ko-fi → <em>Settings → API / Webhooks</em>: wklej URL webhooka i skopiuj stąd verification
          token.
        </p>
        <code className="mt-1 block break-all rounded bg-elevated px-2 py-1 text-accent">
          {WEBHOOK_URL}
        </code>
      </div>
    </div>
  );
}
