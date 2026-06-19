import { ListChecks, Tags, Wand2 } from 'lucide-react';
import ReactionRolePanelForm from '../../components/ReactionRolePanelForm';
import ReactionRolesForm from '../../components/ReactionRolesForm';
import RoleMenuForm from '../../components/RoleMenuForm';
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

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.roles.intro')}</p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Tags size={16} className="text-accent" /> Reaction roles
        </h2>
        <ReactionRolesForm initial={items} guild={guild} />
      </section>

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
