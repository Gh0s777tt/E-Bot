'use client';

// Narzędzie WŁAŚCICIELA — przegląd i zarządzanie subskrypcjami Premium (globalnie, wszystkie serwery).
// Render tylko dla właściciela instancji (gate w diagnostics/page.tsx + twardy gate w /api/dev/premium).
// Spójne z DevReset (hardcoded PL — narzędzie dev/owner, nie i18n).
import { Gift, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Row = {
  guildId: string;
  name: string | null;
  source: string | null;
  since: string | null;
  until: string | null;
  grantedBy: string | null;
  active: boolean;
};

const day = (iso: string | null) => (iso ? iso.slice(0, 10) : '—');

export default function PremiumAdmin({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [guildId, setGuildId] = useState('');
  const [days, setDays] = useState('');
  const [st, setSt] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  const validId = /^\d{15,25}$/.test(guildId.trim());

  async function call(action: 'grant' | 'revoke', gid: string, d?: number) {
    setSt('busy');
    setMsg('');
    try {
      const r = await fetch('/api/dev/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, guildId: gid, days: d }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (r.ok && j.ok) {
        setSt('ok');
        setMsg(
          action === 'grant'
            ? `✓ Nadano Premium serwerowi ${gid}.`
            : `✓ Odebrano Premium serwerowi ${gid}.`,
        );
        if (action === 'grant') {
          setGuildId('');
          setDays('');
        }
        router.refresh();
      } else {
        setSt('err');
        setMsg(j.error || `Błąd ${r.status}`);
      }
    } catch (e) {
      setSt('err');
      setMsg((e as Error).message);
    }
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
            onClick={() => call('grant', guildId.trim(), Number(days) || 0)}
            disabled={!validId || st === 'busy'}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {st === 'busy' ? 'Zapisuję…' : 'Nadaj Premium'}
          </button>
        </div>
        {msg && (
          <p className={`mt-2 text-sm ${st === 'err' ? 'text-accent' : 'text-green-400'}`}>{msg}</p>
        )}
      </div>

      {/* Lista subskrypcji */}
      {rows.length === 0 ? (
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
              {rows.map((r) => (
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
                      onClick={() => call('revoke', r.guildId)}
                      disabled={st === 'busy'}
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
