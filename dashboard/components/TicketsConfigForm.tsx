'use client';

import { useState } from 'react';

type Cfg = {
  enabled: boolean;
  categoryId: string;
  supportRoleId: string;
  welcome: string;
  logChannelId: string;
};

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function TicketsConfigForm({ initial }: { initial: Cfg }) {
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
          <span className="font-semibold text-white/90">Kategoria kanałów (ID)</span>
          <input
            value={c.categoryId}
            onChange={(e) => setC({ ...c, categoryId: e.target.value })}
            placeholder="ID kategorii"
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Rola obsługi (ID)</span>
          <input
            value={c.supportRoleId}
            onChange={(e) => setC({ ...c, supportRoleId: e.target.value })}
            placeholder="ID roli supportu"
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał logów (ID)</span>
          <input
            value={c.logChannelId}
            onChange={(e) => setC({ ...c, logChannelId: e.target.value })}
            placeholder="ID kanału logów"
            className={inputCls}
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
        Otwieranie/zamykanie ticketów wykonuje bot (Faza 4 — strona bota). Panel zapisuje
        konfigurację do Supabase i pokazuje listę zgłoszeń z bazy.
      </p>
    </div>
  );
}
