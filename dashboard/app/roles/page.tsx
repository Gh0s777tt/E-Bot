import { Tags } from 'lucide-react';
import ReactionRolesForm from '../../components/ReactionRolesForm';
import { getReactionRoles } from '../../lib/faza4';

export const dynamic = 'force-dynamic';

export default async function RolesPage() {
  const items = await getReactionRoles();

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Reaction roles: użytkownik klika reakcję pod wskazaną wiadomością → bot nadaje rolę
        (usunięcie reakcji → odbiera). Konfigurację zapisujesz tu (Supabase), bot stosuje ją na
        żywo. Skopiuj ID wiadomości (Discord → tryb developera → „Kopiuj ID wiadomości") i ID roli.
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Tags size={16} className="text-accent" /> Reaction roles
        </h2>
        <ReactionRolesForm initial={items} />
      </section>
    </div>
  );
}
