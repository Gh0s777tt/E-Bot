'use client';

import { CheckCircle2, Loader2, Wifi, XCircle } from 'lucide-react';
import { useState } from 'react';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

type ConnTest = { name: string; ok: boolean; detail: string; ms: number };

// Realny test połączeń (Discord/Supabase/AI) — uderza w /api/diagnostics/test i pokazuje wynik
// per integracja (status + szczegół + latencja). Bez auto-uruchamiania (klik usera).
export default function ConnectionTest() {
  const { lang } = useLang();
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<ConnTest[] | null>(null);

  async function run() {
    setBusy(true);
    try {
      const r = await fetch('/api/diagnostics/test', { cache: 'no-store' });
      const j = (await r.json()) as { tests?: ConnTest[] };
      setResults(j.tests ?? []);
    } catch {
      setResults([]);
    }
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Wifi size={15} />}
        {tp(lang, 'ui.diagnostics.testBtn')}
      </button>

      {results && (
        <ul className="space-y-1.5">
          {results.map((t) => (
            <li key={t.name} className="flex items-center gap-2 text-sm">
              {t.ok ? (
                <CheckCircle2 size={16} className="shrink-0 text-green-400" />
              ) : (
                <XCircle size={16} className="shrink-0 text-accent" />
              )}
              <span className="font-medium">{t.name}</span>
              <span className="truncate text-muted">{t.detail}</span>
              <span className="ms-auto shrink-0 font-mono text-xs text-muted">{t.ms} ms</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
