import { ListChecks, Tags, Wand2 } from 'lucide-react';
import ReactionRolePanelForm from '../../components/ReactionRolePanelForm';
import ReactionRolesForm from '../../components/ReactionRolesForm';
import RoleMenuForm from '../../components/RoleMenuForm';
import { getRoleMenu } from '../../lib/engagement';
import { getReactionPanel, getReactionRoles } from '../../lib/faza4';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function RolesPage() {
  const [items, panel, rolemenu, guild] = await Promise.all([
    getReactionRoles(),
    getReactionPanel(),
    getRoleMenu(),
    getGuildMeta(),
  ]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Reaction roles: użytkownik klika reakcję pod wskazaną wiadomością → bot nadaje rolę
        (usunięcie reakcji → odbiera). Konfigurację zapisujesz tu (Supabase), bot stosuje ją na
        żywo. Rolę wybierasz z listy; ID wiadomości skopiuj z Discorda (tryb developera → „Kopiuj ID
        wiadomości").
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Tags size={16} className="text-accent" /> Reaction roles
        </h2>
        <ReactionRolesForm initial={items} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Wand2 size={16} className="text-accent" /> Reaction roles — utwórz panel (embed)
        </h2>
        <ReactionRolePanelForm initial={panel} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ListChecks size={16} className="text-accent" /> Menu ról (dropdown)
        </h2>
        <RoleMenuForm initial={rolemenu} guild={guild} />
      </section>
    </div>
  );
}
