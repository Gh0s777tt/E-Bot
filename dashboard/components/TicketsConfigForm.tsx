'use client';

import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import MessageEditor from './MessageEditor';
import { ChannelSelect, RoleSelect } from './pickers';

type Cfg = {
  enabled: boolean;
  categoryId: string;
  supportRoleId: string;
  welcome: string;
  logChannelId: string;
  panelMessage: string;
  ratingEnabled: boolean;
};

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function TicketsConfigForm({ initial, guild }: { initial: Cfg; guild: GuildMeta }) {
  const [c, setC] = useState<Cfg>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/tickets', {
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
        <span className="font-semibold text-white/90">System ticketów włączony</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kategoria kanałów</span>
          <ChannelSelect
            value={c.categoryId}
            onChange={(v) => setC({ ...c, categoryId: v })}
            channels={guild.channels}
            kind="category"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Rola obsługi</span>
          <RoleSelect
            value={c.supportRoleId}
            onChange={(v) => setC({ ...c, supportRoleId: v })}
            roles={guild.roles}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał logów</span>
          <ChannelSelect
            value={c.logChannelId}
            onChange={(v) => setC({ ...c, logChannelId: v })}
            channels={guild.channels}
          />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">Wiadomość powitalna ticketu</span>
        <textarea
          value={c.welcome}
          onChange={(e) => setC({ ...c, welcome: e.target.value })}
          rows={3}
          className={inputCls}
        />
      </label>

      <div className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          Wiadomość panelu (komenda <code className="text-accent">/ticketpanel</code>)
        </span>
        <MessageEditor
          value={c.panelMessage}
          onChange={(v) => setC({ ...c, panelMessage: v })}
          rows={2}
          placeholder="Masz sprawę? Otwórz ticket poniżej. 🎟️"
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.ratingEnabled}
          onChange={(e) => setC({ ...c, ratingEnabled: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">
          Proś o ocenę obsługi po zamknięciu (1–5 ⭐)
        </span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={st === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {st === 'saving' ? 'Zapisywanie…' : 'Zapisz'}
        </button>
        {st === 'ok' && <span className="text-sm text-green-400">✓ Zapisano</span>}
        {st === 'err' && <span className="text-sm text-accent">Błąd zapisu</span>}
      </div>
      <p className="text-xs text-muted">
        Bot otwiera ticket przez przycisk (komenda <code className="text-accent">/ticketpanel</code>
        ) lub <code className="text-accent">/ticket otworz</code>; przy zamknięciu wysyła transkrypt
        HTML na kanał logów i w DM do zgłaszającego. Ocena (jeśli włączona) wymaga{' '}
        <code>f5-tickets-schema.sql</code>.
      </p>
    </div>
  );
}
