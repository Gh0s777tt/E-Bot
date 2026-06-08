import { AlertTriangle, Bot, CheckCircle2, Database, Plug, XCircle } from 'lucide-react';
import Link from 'next/link';
import { activeSource, getRawSetting, getSetupChecklist } from '../../lib/data';
import { getIntegrations } from '../../lib/integrations';

export const dynamic = 'force-dynamic';

function Dot({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 size={16} className="shrink-0 text-green-400" />
  ) : (
    <XCircle size={16} className="shrink-0 text-accent" />
  );
}

export default async function DiagnosticsPage() {
  const [src, integrations, checklist, rawStatus] = await Promise.all([
    activeSource(),
    Promise.resolve(getIntegrations()),
    getSetupChecklist(),
    getRawSetting('bot_status'),
  ]);

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
    health >= 80 ? 'Wszystko gotowe' : health >= 50 ? 'Prawie gotowe' : 'Sporo do zrobienia';

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
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.16), transparent 70%)',
          }}
        />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="flex flex-col">
            <span className={`font-display text-6xl font-bold ${tone}`}>{health}%</span>
            <span className="text-sm text-muted">Kondycja konfiguracji</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl tracking-wide">{verdict}</h2>
            <p className="mt-1 text-sm text-muted">
              Bot {botOnline ? 'online' : 'offline'} · źródło danych:{' '}
              {src === 'supabase' ? 'Supabase' : src === 'sqlite' ? 'SQLite' : 'brak'} · integracje{' '}
              {okInt}/{integrations.length} · moduły {doneCfg}/{checklist.length}
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
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
            <Bot size={16} className="text-accent" /> Połączenia
          </h2>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2">
              <Dot ok={botOnline} />
              <span className="flex-1">Bot połączony z Discordem</span>
              <span className="text-xs text-muted">
                {botOnline ? 'online' : 'offline / brak pulsu'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Dot ok={src !== 'none'} />
              <span className="flex-1">Baza danych</span>
              <span className="text-xs text-muted">
                {src === 'supabase'
                  ? 'Supabase (chmura)'
                  : src === 'sqlite'
                    ? 'SQLite (lokalnie)'
                    : 'brak'}
              </span>
            </li>
          </ul>
          {!botOnline && (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Bot nie wysłał pulsu w ostatnich 2 min. Sprawdź, czy proces działa (Railway) i czy ma
              ustawione zmienne Supabase.
            </p>
          )}
        </section>

        {/* Integracje */}
        <section className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
            <Plug size={16} className="text-accent" /> Integracje ({okInt}/{integrations.length})
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
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Database size={16} className="text-accent" /> Konfiguracja modułów ({doneCfg}/
          {checklist.length})
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
                <div className="truncate text-sm font-medium group-hover:text-white">{c.label}</div>
                <div className="truncate text-xs text-muted">{c.hint}</div>
              </div>
              {!c.done && (
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-accent">
                  Ustaw →
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
