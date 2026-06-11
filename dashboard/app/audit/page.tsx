import { History } from 'lucide-react';
import { getAuditLog } from '../../lib/audit';
import { type PanelLocale, tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// Kod obszaru → klucz i18n (tłumaczony w renderze). Nazwy własne (Anti-Nuke/Automod/Modmail)
// tłumacze zostawiają bez zmian.
const AREA_KEYS: Record<string, string> = {
  antinuke: 'ui.audit.areaAntinuke',
  automod: 'ui.audit.areaAutomod',
  aimod: 'ui.audit.areaAimod',
  verification: 'ui.audit.areaVerification',
  antiraid: 'ui.audit.areaAntiraid',
  logging: 'ui.audit.areaLogging',
  modmail: 'ui.audit.areaModmail',
  modules: 'ui.audit.areaModules',
  settings: 'ui.audit.areaSettings',
};

function fmt(ts: string | undefined, locale: PanelLocale): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return ts;
  }
}

export default async function AuditPage() {
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

      <section className="panel-glow overflow-hidden rounded-2xl border border-line bg-card">
        {entries.length === 0 ? (
          <p className="p-6 text-sm text-muted">{tp(lang, 'ui.audit.empty')}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-line border-b text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">{tp(lang, 'ui.audit.colWhen')}</th>
                <th className="px-4 py-3 font-semibold">{tp(lang, 'ui.audit.colWho')}</th>
                <th className="px-4 py-3 font-semibold">{tp(lang, 'ui.audit.colArea')}</th>
                <th className="px-4 py-3 font-semibold">{tp(lang, 'ui.audit.colDetails')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr
                  key={e.id ?? `${e.created_at}-${e.area}-${e.uid}`}
                  className="border-line/50 border-b last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {fmt(e.created_at, lang)}
                  </td>
                  <td className="px-4 py-3">{e.uname || e.uid || tp(lang, 'ui.audit.unknown')}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                      {AREA_KEYS[e.area] ? tp(lang, AREA_KEYS[e.area]) : e.area}
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
