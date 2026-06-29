import { AlertTriangle, Bot, CheckCircle2, Database, Plug, XCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ConnectionTest from '../../components/ConnectionTest';
import DevReset from '../../components/DevReset';
import { activeSource, getRawSetting, getSetupChecklist } from '../../lib/data';
import { getPrimaryGuildId } from '../../lib/guild';
import { getIntegrations } from '../../lib/integrations';
import { tp } from '../../lib/panelI18n';
import { currentSession, isInstanceAdmin } from '../../lib/panelRoles';
import { getPanelLocale } from '../../lib/serverPanelLocale';
import { isOwner } from '../../lib/tenant';

export const dynamic = 'force-dynamic';

function Dot({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 size={16} className="shrink-0 text-green-400" />
  ) : (
    <XCircle size={16} className="shrink-0 text-accent" />
  );
}

export default async function DiagnosticsPage() {
  // Stan integracji/kluczy/health to info instancyjne — tylko admin instancji; inni → pulpit.
  if (!(await isInstanceAdmin())) redirect('/');
  const [src, integrations, checklist, rawStatus, lang] = await Promise.all([
    activeSource(),
    Promise.resolve(getIntegrations()),
    getSetupChecklist(),
    getRawSetting('bot_status'),
    getPanelLocale(),
  ]);

  // Strefa zagrożenia (reset bazy) — TYLKO właściciel instancji (env), nie staff/tenant-admin.
  const sess = await currentSession();
  const isDev = !!sess?.uid && isOwner(sess.uid);
  const devGuildId = isDev ? await getPrimaryGuildId() : '';

  let botOnline = false;
  try {
    if (rawStatus) {
      const d = JSON.parse(rawStatus) as { online?: boolean; ts?: number };
      botOnline = !!d.online && typeof d.ts === 'number' && Date.now() - d.ts < 120_000;
    }
  } catch {
    /* brak heartbeatu */
  }

  const okInt = integrations.filter((i) => i.ok).length;
  const doneCfg = checklist.filter((c) => c.done).length;
  const connOk = (botOnline ? 1 : 0) + (src !== 'none' ? 1 : 0);
  const health = Math.round((100 * (connOk + doneCfg)) / (2 + checklist.length));
  const tone = health >= 80 ? 'text-green-400' : health >= 50 ? 'text-amber-400' : 'text-accent';
  const verdict =
    health >= 80
      ? tp(lang, 'ui.diagnostics.verdictReady')
      : health >= 50
        ? tp(lang, 'ui.diagnostics.verdictAlmost')
        : tp(lang, 'ui.diagnostics.verdictTodo');
  const srcNote =
    src === 'supabase'
      ? 'Supabase'
      : src === 'sqlite'
        ? 'SQLite'
        : tp(lang, 'ui.diagnostics.srcNone');

  // Integracje pogrupowane.
  const groups = new Map<string, typeof integrations>();
  for (const i of integrations) {
    const arr = groups.get(i.group) ?? [];
    arr.push(i);
    groups.set(i.group, arr);
  }

  return (
    <div className="space-y-6">
      {/* Health score */}
      <section className="panel-glow relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-card to-bg p-6">
        <div
          className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.16), transparent 70%)',
          }}
        />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="flex flex-col">
            <span className={`font-display text-6xl font-bold ${tone}`}>{health}%</span>
            <span className="text-sm text-muted">{tp(lang, 'ui.diagnostics.healthLabel')}</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl tracking-wide">{verdict}</h2>
            <p className="mt-1 text-sm text-muted">
              Bot {botOnline ? tp(lang, 'ui.online') : tp(lang, 'ui.offline')} ·{' '}
              {tp(lang, 'ui.diagnostics.srcLabel')} {srcNote} ·{' '}
              {tp(lang, 'ui.diagnostics.sumIntegrations')} {okInt}/{integrations.length} ·{' '}
              {tp(lang, 'ui.diagnostics.sumModules')} {doneCfg}/{checklist.length}
            </p>
          </div>
        </div>
        <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-dark transition-all"
            style={{ width: `${health}%` }}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Połączenia */}
        <section className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
            <Bot size={16} className="text-accent" /> {tp(lang, 'ui.diagnostics.connHeading')}
          </h2>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2">
              <Dot ok={botOnline} />
              <span className="flex-1">{tp(lang, 'ui.diagnostics.connBot')}</span>
              <span className="text-xs text-muted">
                {botOnline ? tp(lang, 'ui.online') : tp(lang, 'ui.diagnostics.connBotOffline')}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Dot ok={src !== 'none'} />
              <span className="flex-1">{tp(lang, 'ui.diagnostics.connDb')}</span>
              <span className="text-xs text-muted">
                {src === 'supabase'
                  ? tp(lang, 'ui.diagnostics.dbSupabase')
                  : src === 'sqlite'
                    ? tp(lang, 'ui.diagnostics.dbSqlite')
                    : tp(lang, 'ui.diagnostics.srcNone')}
              </span>
            </li>
          </ul>
          <div className="mt-4 border-t border-line/60 pt-4">
            <ConnectionTest />
          </div>
          {!botOnline && (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              {tp(lang, 'ui.diagnostics.botWarning')}
            </p>
          )}
        </section>

        {/* Integracje */}
        <section className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
            <Plug size={16} className="text-accent" /> {tp(lang, 'ui.diagnostics.intHeading')} (
            {okInt}/{integrations.length})
          </h2>
          <div className="space-y-3">
            {[...groups.entries()].map(([group, items]) => (
              <div key={group}>
                <div className="mb-1 text-[11px] uppercase tracking-wide text-muted">{group}</div>
                <ul className="space-y-1.5 text-sm">
                  {items.map((i) => (
                    <li key={i.name} className="flex items-center gap-2">
                      <Dot ok={i.ok} />
                      <span className="flex-1">{i.name}</span>
                      <span className="text-xs text-muted">{i.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Konfiguracja modułów */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Database size={16} className="text-accent" /> {tp(lang, 'ui.diagnostics.cfgHeading')} (
          {doneCfg}/{checklist.length})
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {checklist.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex items-center gap-2.5 rounded-xl border border-line bg-bg/40 p-3 transition hover:border-accent/50"
            >
              <Dot ok={c.done} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium group-hover:text-white">
                  {tp(lang, c.labelKey)}
                </div>
                <div className="truncate text-xs text-muted">{tp(lang, c.hintKey)}</div>
              </div>
              {!c.done && (
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-accent">
                  {tp(lang, 'ui.diagnostics.setBtn')}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ===== STREFA ZAGROŻENIA — reset bazy (tylko właściciel instancji) ===== */}
      {isDev && (
        <section className="rounded-2xl border border-accent/40 bg-accent/5 p-5">
          <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold tracking-wide text-accent">
            <AlertTriangle size={16} /> Strefa zagrożenia — reset bazy (developer)
          </h2>
          <p className="mb-4 text-sm text-muted">
            Widoczne tylko dla właściciela instancji. Operacje są <strong>nieodwracalne</strong>.
            Wymaga uruchomienia <code className="text-accent">dashboard/scripts/_ALL.sql</code>{' '}
            (funkcje <code className="text-accent">dev_reset_*</code>).
          </p>
          <DevReset currentGuildId={devGuildId} />
        </section>
      )}
    </div>
  );
}
