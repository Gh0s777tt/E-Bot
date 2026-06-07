import { TerminalSquare } from 'lucide-react';
import { getRegisteredCommands } from '../../lib/commands';

export const dynamic = 'force-dynamic';

export default async function CommandsPage() {
  const commands = await getRegisteredCommands();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Slash-komendy <strong>realnie zarejestrowane</strong> przez bota (pobierane na żywo z
        Discord API).{' '}
        {commands.length > 0 && <span className="text-accent">Łącznie: {commands.length}.</span>}
      </p>

      <section className="panel-glow overflow-hidden rounded-2xl border border-line bg-card">
        <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 text-base font-semibold uppercase tracking-wide">
          <TerminalSquare size={16} className="text-accent" /> Komendy
        </h2>
        {commands.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">
            Nie udało się pobrać listy z Discord API (brak tokenu bota lub komendy jeszcze nie
            zarejestrowane). Uruchom{' '}
            <code className="text-accent">node bot/src/deploy-commands.mts</code>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Komenda</th>
                  <th className="px-5 py-3 font-medium">Opis</th>
                  <th className="px-5 py-3 font-medium">Podkomendy</th>
                </tr>
              </thead>
              <tbody>
                {commands.map((c) => (
                  <tr key={c.name} className="border-t border-line align-top">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-accent">/{c.name}</td>
                    <td className="px-5 py-3 text-white/80">{c.description || '—'}</td>
                    <td className="px-5 py-3 text-muted">
                      {c.subs.length ? (
                        <span className="flex flex-wrap gap-1">
                          {c.subs.map((s) => (
                            <span
                              key={s.name}
                              title={s.description}
                              className="rounded-md bg-elevated px-2 py-0.5 font-mono text-xs text-white/70"
                            >
                              {s.name}
                            </span>
                          ))}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-muted">
        Lista odświeża się automatycznie po <code>deploy-commands</code> (rejestracja globalna ~do 1
        h propagacji w kliencie Discord).
      </p>
    </div>
  );
}
