import { History } from 'lucide-react';
import { redirect } from 'next/navigation';
import AuditLog from '../../components/AuditLog';
import { getAuditLog } from '../../lib/audit';
import { tp } from '../../lib/panelI18n';
import { isInstanceAdmin } from '../../lib/panelRoles';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  // Powierzchnia instancyjna (log z IP) — tylko admin instancji; inni → przekierowanie na pulpit.
  if (!(await isInstanceAdmin())) redirect('/');
  const [entries, lang] = await Promise.all([getAuditLog(100), getPanelLocale()]);
  return (
    <div className="max-w-4xl space-y-6">
      <header className="flex items-center gap-3">
        <History className="h-6 w-6 text-accent" />
        <div>
          <h1 className="font-display text-2xl tracking-wide">{tp(lang, 'ui.audit.title')}</h1>
          <p className="text-sm text-muted">{tp(lang, 'ui.audit.desc')}</p>
        </div>
      </header>

      <AuditLog entries={entries} lang={lang} />
    </div>
  );
}
