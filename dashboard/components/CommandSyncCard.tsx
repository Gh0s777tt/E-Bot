'use client';

// Discovery B5 (#685) — narzędzie WŁAŚCICIELA na /diagnostics: „Zsynchronizuj komendy".
// Zapisuje żądanie do settings ('deploy_commands_request'); bot polluje co 30 s i wykonuje
// globalną rejestrację slash-komend, zapisując wynik do 'deploy_commands_result'.
// Hardcoded PL — narzędzie owner (konwencja jak PremiumAdmin/DevReset).
import { RefreshCw } from 'lucide-react';
import { useState, useTransition } from 'react';
import { requestCommandSyncAction } from '../app/diagnostics/actions';

export type CommandSyncState = {
  pending: boolean; // żądanie nowsze niż ostatni wynik → bot jeszcze nie obsłużył
  result: { ok: boolean; count?: number; error?: string; ts?: number } | null;
};

const when = (ts?: number) => (ts ? new Date(ts).toLocaleString('pl-PL') : '');

export default function CommandSyncCard({ state }: { state: CommandSyncState }) {
  const [pendingUi, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  function sync() {
    if (pendingUi) return;
    setErr('');
    startTransition(async () => {
      try {
        await requestCommandSyncAction();
        setSent(true);
      } catch (e) {
        setErr((e as Error).message);
      }
    });
  }

  const waiting = sent || state.pending;
  return (
    <div className="rounded-xl border border-line bg-bg/40 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <RefreshCw size={15} className="text-accent" /> Synchronizacja slash-komend
      </div>
      <p className="mb-3 text-xs text-muted">
        Rejestruje globalnie aktualny zestaw komend bota (to samo co skrypt{' '}
        <code>deploy-commands</code>, bez terminala). Bot odbiera żądanie do ~30 s; propagacja
        globalna Discorda może potrwać do ~1 h.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={sync}
          disabled={pendingUi || waiting}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw size={14} className={pendingUi || waiting ? 'animate-spin' : ''} />
          {waiting ? 'Czekam na bota…' : 'Zsynchronizuj komendy'}
        </button>
        {!waiting && state.result && (
          <span className={`text-sm ${state.result.ok ? 'text-green-400' : 'text-accent'}`}>
            {state.result.ok
              ? `✅ Ostatnia synchronizacja: ${state.result.count} komend · ${when(state.result.ts)}`
              : `❌ Błąd: ${state.result.error || 'nieznany'} · ${when(state.result.ts)}`}
          </span>
        )}
        {err && <span className="text-sm text-accent">{err}</span>}
      </div>
    </div>
  );
}
