import { ClipboardList } from 'lucide-react';
import ApplicationsForm from '../../components/ApplicationsForm';
import { getApplicationsConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  const [cfg, guild] = await Promise.all([getApplicationsConfig(), getGuildMeta()]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Rekrutacja/aplikacje: opublikuj panel komendą{' '}
        <code className="text-accent">/applypanel</code>. Kandydat wypełnia formularz (modal),
        zgłoszenie trafia na kanał recenzji z przyciskami Akceptuj/Odrzuć — akceptacja nadaje rolę i
        wysyła DM. Konfigurację bot stosuje na żywo.
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ClipboardList size={16} className="text-accent" /> Aplikacje / rekrutacja
        </h2>
        <ApplicationsForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
