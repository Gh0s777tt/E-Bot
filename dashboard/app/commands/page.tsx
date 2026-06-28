import {
  Banknote,
  Dices,
  Gamepad2,
  type LucideIcon,
  Radio,
  Server,
  ShieldAlert,
  Sparkles,
  Tags,
  TerminalSquare,
  Ticket,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import { getRegisteredCommands, groupCommands } from '../../lib/commands';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

const GROUP_ICONS: Record<string, LucideIcon> = {
  'Ogólne & narzędzia': Wrench,
  'Biblioteka & gry': Gamepad2,
  'Moderacja & bezpieczeństwo': ShieldAlert,
  'Role & uprawnienia': Tags,
  'Wsparcie & panele': Ticket,
  AI: Sparkles,
  'Poziomy & profil': Trophy,
  Ekonomia: Banknote,
  Społeczność: Users,
  'Twórca & live': Radio,
  Zabawa: Dices,
  'Administracja serwera': Server,
  Inne: TerminalSquare,
};

export default async function CommandsPage() {
  const [commands, lang] = await Promise.all([getRegisteredCommands(), getPanelLocale()]);
  const groups = groupCommands(commands);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        {tp(lang, 'ui.commands.intro')}{' '}
        {commands.length > 0 && (
          <span className="text-accent">
            {tp(lang, 'ui.commands.total')} {commands.length}.
          </span>
        )}
      </p>

      {commands.length === 0 ? (
        <section className="panel-glow rounded-2xl border border-line bg-card px-5 py-6">
          <p className="text-sm text-muted">
            {tp(lang, 'ui.commands.emptyErrorPre')}
            <code className="text-accent">node bot/src/deploy-commands.mts</code>.
          </p>
        </section>
      ) : (
        groups.map((g) => {
          const Icon = GROUP_ICONS[g.label] ?? TerminalSquare;
          return (
            <section
              key={g.label}
              className="panel-glow overflow-hidden rounded-2xl border border-line bg-card"
            >
              <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 font-display text-lg font-semibold tracking-wide">
                <Icon size={16} className="text-accent" /> {g.label}
                <span className="ms-auto rounded-md bg-elevated px-2 py-0.5 text-xs font-normal normal-case text-muted">
                  {g.commands.length}
                </span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="text-start text-[11px] uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-5 py-3 font-medium">{tp(lang, 'ui.commands.thCommand')}</th>
                      <th className="px-5 py-3 font-medium">{tp(lang, 'ui.commands.thDesc')}</th>
                      <th className="px-5 py-3 font-medium">{tp(lang, 'ui.commands.thSubs')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.commands.map((c) => (
                      <tr key={c.name} className="border-t border-line align-top">
                        <td className="whitespace-nowrap px-5 py-3 font-mono text-accent">
                          /{c.name}
                        </td>
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
            </section>
          );
        })
      )}

      <p className="text-xs text-muted">
        {tp(lang, 'ui.commands.footerPre')}
        <code>deploy-commands</code>
        {tp(lang, 'ui.commands.footerPost')}
      </p>
    </div>
  );
}
