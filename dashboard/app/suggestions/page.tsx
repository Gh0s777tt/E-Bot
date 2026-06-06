import { Lightbulb, ListChecks } from 'lucide-react';
import SuggestionsForm from '../../components/SuggestionsForm';
import { getSuggestionsConfig } from '../../lib/community';
import { getSuggestions } from '../../lib/faza4';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

const SUG_STYLE: Record<string, string> = {
  open: 'bg-yellow-500/15 text-yellow-300',
  approved: 'bg-green-500/15 text-green-300',
  denied: 'bg-accent/20 text-accent',
  considered: 'bg-sky-500/15 text-sky-300',
};
const SUG_LABEL: Record<string, string> = {
  open: 'Otwarta',
  approved: 'Zatwierdzona',
  denied: 'Odrzucona',
  considered: 'Rozważana',
};

function fmt(d: string): string {
  try {
    return new Date(d).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return d;
  }
}

export default async function SuggestionsPage() {
  const [cfg, list, guild] = await Promise.all([
    getSuggestionsConfig(),
    getSuggestions(40),
    getGuildMeta(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Skrzynka sugestii społeczności: <code className="text-accent">/suggest</code> publikuje
        propozycję z głosowaniem 👍/👎; moderacja decyduje przyciskami. Dodatkowo{' '}
        <code className="text-accent">/poll</code> tworzy szybką ankietę (reakcje 1️⃣–🔟 lub 👍/👎).{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Sugestie: WŁĄCZONE</span>
        ) : (
          <span className="font-semibold text-accent">Sugestie: WYŁĄCZONE</span>
        )}
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Lightbulb size={16} className="text-accent" /> Sugestie
        </h2>
        <SuggestionsForm initial={cfg} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ListChecks size={16} className="text-accent" /> Ostatnie sugestie
        </h2>
        {list.length === 0 ? (
          <p className="text-sm text-muted">
            Brak sugestii. Pojawią się tutaj po zgłoszeniu przez{' '}
            <code className="text-accent">/suggest</code> (wymaga <code>_ALL.sql</code> w Supabase).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Treść</th>
                  <th className="px-3 py-2">Autor</th>
                  <th className="px-3 py-2">Kiedy</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id} className="border-b border-line/50">
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${SUG_STYLE[s.status] ?? 'bg-line text-muted'}`}
                      >
                        {SUG_LABEL[s.status] ?? s.status}
                      </span>
                    </td>
                    <td className="max-w-md px-3 py-2">{s.content}</td>
                    <td className="px-3 py-2 text-muted">{s.username || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">{fmt(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
