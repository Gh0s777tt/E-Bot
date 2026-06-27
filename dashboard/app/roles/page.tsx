import { Eye, ListChecks, Tags, Wand2 } from 'lucide-react';
import ReactionRolePanelForm from '../../components/ReactionRolePanelForm';
import ReactionRolesForm from '../../components/ReactionRolesForm';
import RoleMenuForm from '../../components/RoleMenuForm';
import StatusPill from '../../components/StatusPill';
import { getRoleMenu } from '../../lib/engagement';
import { getReactionPanel, getReactionRoles } from '../../lib/faza4';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function RolesPage() {
  const [items, panel, rolemenu, guild, lang] = await Promise.all([
    getReactionRoles(),
    getReactionPanel(),
    getRoleMenu(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  const hasRoles = items.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.roles.intro')}</p>
        <StatusPill on={hasRoles} lang={lang} />
      </header>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Tags size={16} className="text-accent" /> Reaction roles
          <span className="ms-auto normal-case">
            <StatusPill on={hasRoles} lang={lang} />
          </span>
        </h2>
        <ReactionRolesForm initial={items} guild={guild} />
      </section>

      {hasRoles && (
        <section className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
            <Eye size={16} className="text-accent" /> {tp(lang, 'ui.cmd.preview')}
          </h2>
          <div className="max-w-md rounded-xl border border-line bg-bg/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-[11px] font-semibold text-white">
                E
              </span>
              <span className="text-xs font-medium">E-BOT</span>
              <span className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-muted">bot</span>
            </div>
            <div className="cmd-embed">
              <div className="flex flex-wrap gap-2">
                {items.slice(0, 10).map((it) => {
                  const role = guild.roles.find((r) => r.id === it.roleId);
                  const name = role?.name ?? it.roleId;
                  const dot =
                    role && role.color > 0
                      ? `#${role.color.toString(16).padStart(6, '0')}`
                      : 'rgb(var(--accent-rgb))';
                  return (
                    <span
                      key={`${it.messageId}-${it.emoji}-${it.roleId}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-accent/40 px-3 py-1.5 text-xs text-accent"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Wand2 size={16} className="text-accent" /> {tp(lang, 'ui.roles.heading2')}
        </h2>
        <ReactionRolePanelForm initial={panel} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ListChecks size={16} className="text-accent" /> {tp(lang, 'ui.roles.heading3')}
        </h2>
        <RoleMenuForm initial={rolemenu} guild={guild} />
      </section>
    </div>
  );
}
