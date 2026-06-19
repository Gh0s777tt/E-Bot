import Link from 'next/link';
import { groupLabel, tp } from '../../lib/panelI18n';
import { getPluginCatalog, type PluginCatalogEntry } from '../../lib/pluginCatalog';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// M2 — UI marketplace: katalog pluginów (read-only) z jednego źródła `getPluginCatalog`
// (first-party z kodu + community z DB). Toggle enable per-serwer = osobny przyrost; tu
// prezentacja + odnośnik „konfig" do istniejącego formularza modułu (href).
export default async function MarketplacePage() {
  const [catalog, lang] = await Promise.all([getPluginCatalog(), getPanelLocale()]);

  // Grupowanie z zachowaniem kolejności pierwszego wystąpienia grupy.
  const groups = new Map<string, PluginCatalogEntry[]>();
  for (const p of catalog) {
    const arr = groups.get(p.group);
    if (arr) arr.push(p);
    else groups.set(p.group, [p]);
  }

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.modules.intro')}</p>
      {[...groups.entries()].map(([group, plugins]) => (
        <section key={group} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted/70">
            {groupLabel(lang, group)}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plugins.map((p) => (
              <div
                key={p.key}
                className="flex flex-col gap-2 rounded-lg border border-line bg-card p-4 transition hover:border-accent/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-white">{p.title}</span>
                  <div className="flex shrink-0 gap-1">
                    {p.source === 'community' && (
                      <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                        community
                      </span>
                    )}
                    {p.tierRequired === 'premium' && (
                      <span className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
                        premium
                      </span>
                    )}
                  </div>
                </div>
                {p.description && <p className="text-xs text-muted">{p.description}</p>}
                {p.href && (
                  <Link
                    href={p.href}
                    className="mt-auto inline-flex w-fit items-center gap-1 text-xs text-accent transition hover:underline"
                  >
                    {tp(lang, 'ui.modules.config')} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
