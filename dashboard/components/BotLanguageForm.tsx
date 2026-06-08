'use client';

import { useState } from 'react';
import { BOT_LOCALE_OPTIONS, type BotLocale } from '../lib/botLocales';

const selectCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function BotLanguageForm({ initial }: { initial: BotLocale }) {
  const [locale, setLocale] = useState<BotLocale>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="max-w-md space-y-4">
      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Język odpowiedzi bota</span>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as BotLocale)}
          className={selectCls}
        >
          {BOT_LOCALE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
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
        <strong className="text-white/80">Auto</strong> = każdy użytkownik widzi odpowiedzi w języku
        swojego klienta Discord. Wybór konkretnego języka{' '}
        <strong className="text-white/80">wymusza go dla całego serwera</strong>. Opisy slash-komend
        i tak pokazują się w języku Discorda użytkownika (natywna lokalizacja). Zmiana wchodzi w
        bocie w ~minutę (Supabase → settings-sync).
      </p>
    </div>
  );
}
