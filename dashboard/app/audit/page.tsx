import { History } from 'lucide-react';
import { getAuditLog } from '../../lib/audit';

export const dynamic = 'force-dynamic';

const AREA_LABELS: Record<string, string> = {
  antinuke: 'Anti-Nuke',
  automod: 'Automod',
  aimod: 'AI-moderacja',
  verification: 'Weryfikacja',
  antiraid: 'Anti-raid',
  logging: 'Logi serwera',
  modmail: 'Modmail',
  modules: 'Centrum sterowania',
  settings: 'Ustawienia',
};

function fmt(ts?: string): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return ts;
  }
}

export default async function AuditPage() {
  const entries = await getAuditLog(100);
  return (
    <div className="max-w-4xl space-y-6">
      <header className="flex items-center gap-3">
        <History className="h-6 w-6 text-accent" />
        <div>
          <h1 className="font-display text-2xl tracking-wide">Dziennik zmian</h1>
          <p className="text-sm text-muted">Kto, co i kiedy zmienił w konfiguracji bota.</p>
        </div>
      </header>

      <section className="panel-glow overflow-hidden rounded-2xl border border-line bg-card">
        {entries.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            Brak wpisów. Dziennik zapełni się przy najbliższych zmianach konfiguracji (wymaga tabeli{' '}
            <code className="font-mono text-accent">settings_audit</code> w Supabase).
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-line border-b text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Kiedy</th>
                <th className="px-4 py-3 font-semibold">Kto</th>
                <th className="px-4 py-3 font-semibold">Obszar</th>
                <th className="px-4 py-3 font-semibold">Szczegóły</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr
                  key={e.id ?? `${e.created_at}-${e.area}-${e.uid}`}
                  className="border-line/50 border-b last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{fmt(e.created_at)}</td>
                  <td className="px-4 py-3">{e.uname || e.uid || 'nieznany'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                      {AREA_LABELS[e.area] ?? e.area}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{e.detail || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
