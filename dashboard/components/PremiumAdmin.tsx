'use client';

// Narzędzie WŁAŚCICIELA — przegląd i zarządzanie subskrypcjami Premium (globalnie, wszystkie serwery).
// Render tylko dla właściciela instancji (gate w diagnostics/page.tsx + twardy gate w Server Action).
// #671 (modernizacja): Server Actions + useOptimistic — tabela reaguje NATYCHMIAST (rollback przy
// błędzie), bez ręcznego fetch('/api/...')/JSON. Spójne z DevReset (hardcoded PL — narzędzie owner).
import { Gift, Trash2 } from 'lucide-react';
import { useOptimistic, useState, useTransition } from 'react';
import { grantPremiumAction, revokePremiumAction } from '../app/diagnostics/actions';

type Row = {
  guildId: string;
  name: string | null;
  source: string | null;
  since: string | null;
  until: string | null;
  grantedBy: string | null;
  active: boolean;
};

type Op =
  | { kind: 'grant'; guildId: string; until: string | null }
  | { kind: 'revoke'; guildId: string };

const day = (iso: string | null) => (iso ? iso.slice(0, 10) : '—');
const DAY_MS = 86_400_000;

export default function PremiumAdmin({ rows }: { rows: Row[] }) {
  const [guildId, setGuildId] = useState('');
  const [days, setDays] = useState('');
  const [err, setErr] = useState('');
  const [pending, startTransition] = useTransition();

  // Optymistyczny widok tabeli — zsynchronizuje się z serwerem po revalidatePath w akcji.
  const [optimisticRows, applyOptimistic] = useOptimistic(rows, (state, op: Op) => {
    if (op.kind === 'revoke') return state.filter((r) => r.guildId !== op.guildId);
    const row: Row = {
      guildId: op.guildId,
      name: state.find((r) => r.guildId === op.guildId)?.name ?? null,
      source: 'manual',
      since: new Date().toISOString(),
      until: op.until,
      grantedBy: null,
      active: true,
    };
    return state.some((r) => r.guildId === op.guildId)
      ? state.map((r) => (r.guildId === op.guildId ? row : r))
      : [row, ...state];
  });

  const validId = /^\d{15,25}$/.test(guildId.trim());

  function grant() {
    const gid = guildId.trim();
    const d = Number(days) || 0;
    if (!validId || pending) return;
    setErr('');
    startTransition(async () => {
      applyOptimistic({
        kind: 'grant',
        guildId: gid,
        until: d > 0 ? new Date(Date.now() + d * DAY_MS).toISOString() : null,
      });
      try {
        await grantPremiumAction(gid, d);
        setGuildId('');
        setDays('');
      } catch (e) {
        setErr((e as Error).message);
      }
    });
  }

  function revoke(gid: string) {
    if (pending) return;
    setErr('');
    startTransition(async () => {
      applyOptimistic({ kind: 'revoke', guildId: gid });
      try {
        await revokePremiumAction(gid);
      } catch (e) {
        setErr((e as Error).message);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Nadanie ręczne */}
      <div className="rounded-xl border border-line bg-bg/40 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <Gift size={15} className="text-accent" /> Nadaj Premium ręcznie (gift / współpraca /
          test)
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted">
              ID serwera
            </span>
            <input
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
              placeholder="np. 123456789012345678"
              className="w-64 rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted">
              Na ile dni (0 = bezterminowo)
            </span>
            <input
              value={days}
              inputMode="numeric"
              onChange={(e) => setDays(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              className="w-44 rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <button
            type="button"
            onClick={grant}
            disabled={!validId || pending}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? 'Zapisuję…' : 'Nadaj Premium'}
          </button>
        </div>
        {err && <p className="mt-2 text-sm text-accent">{err}</p>}
      </div>

      {/* Lista subskrypcji */}
      {optimisticRows.length === 0 ? (
        <p className="rounded-xl border border-line bg-bg/40 p-4 text-sm text-muted">
          Brak serwerów Premium. Nadaj ręcznie powyżej albo poczekaj na zakup przez Stripe.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-start text-sm">
            <thead className="bg-surface/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 text-start">Serwer</th>
                <th className="px-3 py-2 text-start">Źródło</th>
                <th className="px-3 py-2 text-start">Od</th>
                <th className="px-3 py-2 text-start">Do</th>
                <th className="px-3 py-2 text-start">Status</th>
                <th className="px-3 py-2 text-start">Nadał</th>
                <th className="px-3 py-2 text-end">Akcja</th>
              </tr>
            </thead>
            <tbody>
              {optimisticRows.map((r) => (
                <tr key={r.guildId} className="border-t border-line/60 align-middle">
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{r.name || '—'}</div>
                    <code className="text-xs text-muted">{r.guildId}</code>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${r.source === 'stripe' ? 'bg-sky-500/15 text-sky-300' : 'bg-accent/15 text-accent'}`}
                    >
                      {r.source === 'stripe' ? 'Stripe' : r.source === 'manual' ? 'Ręczne' : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted">{day(r.since)}</td>
                  <td className="px-3 py-2 text-muted">
                    {r.until ? day(r.until) : 'bezterminowo'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={r.active ? 'text-green-400' : 'text-amber-400'}>
                      {r.active ? 'aktywna' : 'wygasła'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">
                    {r.grantedBy ? <code>{r.grantedBy}</code> : '—'}
                  </td>
                  <td className="px-3 py-2 text-end">
                    <button
                      type="button"
                      onClick={() => revoke(r.guildId)}
                      disabled={pending}
                      className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs text-muted transition hover:border-accent/50 hover:text-accent disabled:opacity-40"
                    >
                      <Trash2 size={13} /> Odbierz
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
