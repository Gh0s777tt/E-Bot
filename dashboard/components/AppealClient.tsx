'use client';

import { useState } from 'react';
import { type PanelLocale, tp } from '../lib/panelI18n';

export default function AppealClient({
  guildId,
  uname,
  lang,
}: {
  guildId: string;
  uname: string;
  lang: PanelLocale;
}) {
  const [reason, setReason] = useState('');
  const [st, setSt] = useState<'idle' | 'sending' | 'ok' | 'err' | 'dup'>('idle');

  async function submit() {
    if (reason.trim().length < 10) return;
    setSt('sending');
    try {
      const r = await fetch('/api/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId, reason: reason.trim() }),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string };
      setSt(r.ok ? 'ok' : d?.error === 'duplicate' ? 'dup' : 'err');
    } catch {
      setSt('err');
    }
  }

  if (st === 'ok') return <p className="text-green-400 text-sm">{tp(lang, 'ui.appeals.sent')}</p>;

  return (
    <div className="space-y-3">
      <p className="text-muted text-sm">
        {tp(lang, 'ui.appeals.loggedAs')} <strong className="text-white/90">{uname}</strong>
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={5}
        maxLength={1000}
        placeholder={tp(lang, 'ui.appeals.reasonPh')}
        className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={submit}
        disabled={st === 'sending' || reason.trim().length < 10}
        className="rounded-lg bg-accent px-4 py-2 font-semibold text-sm text-white transition hover:bg-accent-dark disabled:opacity-50"
      >
        {st === 'sending' ? '…' : tp(lang, 'ui.appeals.submit')}
      </button>
      {st === 'dup' && <p className="text-amber-300 text-sm">{tp(lang, 'ui.appeals.duplicate')}</p>}
      {st === 'err' && <p className="text-accent text-sm">{tp(lang, 'ui.appeals.error')}</p>}
    </div>
  );
}
