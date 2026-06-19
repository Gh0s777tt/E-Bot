'use client';

import { useEffect } from 'react';
import { useLang } from '../components/LangContext';
import { tp } from '../lib/panelI18n';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useLang();
  // Faza 7 / F10.3 — zgłoś błąd do Sentry (server-side, no-op gdy brak SENTRY_DSN).
  useEffect(() => {
    void fetch('/api/sentry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: error.message, stack: error.stack, digest: error.digest }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent font-display text-2xl shadow-glow">
        !
      </div>
      <h2 className="font-display text-2xl uppercase tracking-wide">
        {tp(lang, 'ui.sys.errTitle')}
      </h2>
      <p className="max-w-md text-sm text-muted">
        {error.message || tp(lang, 'ui.sys.errFallback')}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-wide transition hover:bg-accent-hover"
      >
        {tp(lang, 'ui.sys.errRetry')}
      </button>
    </div>
  );
}
