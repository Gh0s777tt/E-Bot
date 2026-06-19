'use client';

// M2 — interaktywny katalog marketplace. Toggle first-party reużywa POST /api/modules
// (ta sama, audytowana, chokepointem scope'owana ścieżka co Centrum sterowania). Community
// (3rd-party) ma toggle wyłączony do czasu M6 (enable per-serwer przez `guild_plugins`).
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { groupLabel, tp } from '../lib/panelI18n';
import type { PluginCatalogEntry } from '../lib/pluginCatalog';
import { useLang } from './LangContext';

function Toggle({
  on,
  onClick,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${on ? 'bg-accent' : 'bg-white/20'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'start-[22px]' : 'start-0.5'}`}
      />
    </button>
  );
}

export default function MarketplaceGrid({
  entries,
  initial,
  guildTier = 'free',
  billingOn = false,
}: {
  entries: PluginCatalogEntry[];
  initial: Record<string, boolean>;
  guildTier?: 'free' | 'premium';
  billingOn?: boolean;
}) {
  const { lang } = useLang();
  const [states, setStates] = useState<Record<string, boolean>>(initial);

  async function flip(key: string) {
    const next = !states[key];
    setStates((s) => ({ ...s, [key]: next }));
    try {
      const r = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled: next }),
      });
      if (!r.ok) throw new Error('fail');
    } catch {
      setStates((s) => ({ ...s, [key]: !next })); // rollback przy błędzie
    }
  }

  // M5 — start Stripe Checkout dla bieżącego serwera (premium). Przekierowanie na stronę Stripe.
  async function upgrade() {
    try {
      const r = await fetch('/api/billing/checkout', { method: 'POST' });
      const j = (await r.json()) as { url?: string };
      if (j.url) window.location.href = j.url;
    } catch {
      /* brak sieci / billing off — przycisk nie robi nic */
    }
  }

  // Grupowanie z zachowaniem kolejności pierwszego wystąpienia.
  const groups: string[] = [];
  for (const e of entries) if (!groups.includes(e.group)) groups.push(e.group);

  return (
    <div className="space-y-6">
      {billingOn && guildTier === 'free' && (
        <button
          type="button"
          onClick={upgrade}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/50 bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent/20"
        >
          <Sparkles size={15} /> Premium
        </button>
      )}
      {groups.map((group) => (
        <section key={group} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted/70">
            {groupLabel(lang, group)}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries
              .filter((p) => p.group === group)
              .map((p) => {
                const community = p.source === 'community';
                // M5 — premium-plugin na serwerze 'free' (gdy billing włączony) → zablokowany.
                const locked = billingOn && p.tierRequired === 'premium' && guildTier !== 'premium';
                return (
                  <div
                    key={p.key}
                    className="flex flex-col gap-2 rounded-lg border border-line bg-card p-4 transition hover:border-accent/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`font-semibold ${states[p.key] ? 'text-white' : 'text-white/70'}`}
                      >
                        {p.title}
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {community && (
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
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      {p.href ? (
                        <Link
                          href={p.href}
                          className="inline-flex items-center gap-1 text-xs text-accent transition hover:underline"
                        >
                          {tp(lang, 'ui.modules.config')} →
                        </Link>
                      ) : (
                        <span />
                      )}
                      <Toggle
                        on={!!states[p.key]}
                        onClick={() => flip(p.key)}
                        disabled={community || locked}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
