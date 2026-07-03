'use client';

// Discovery A2 (#675): licznik użycia „X / N" + upsell W MIEJSCU limitu. Problem (P2): limit Free
// był widoczny dopiero PO kliknięciu Zapisz (403), jako tekst znikający po 4 s — user nie wiedział,
// że dobija do limitu. Ten miernik pokazuje to PROAKTYWNIE (pasek + licznik), a przy limicie renderuje
// istniejący <PremiumDialog> (klikalne CTA → Stripe Checkout) zamiast martwego tekstu. Reużywa
// PLAN_LIMITS (liczby przekazuje strona server-side przez planLimit — z uwzględnieniem env-override).
// Bez billingu (brak Stripe) = null (spójnie z canUsePlugin: bez paywalla nie naciskamy na Premium).
import { AlertTriangle, Sparkles } from 'lucide-react';
import type { Tier } from '../lib/billing';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import PremiumDialog from './PremiumDialog';

export type UsageLevel = 'ok' | 'near' | 'over';

// Poziom wykorzystania limitu (czyste, testowalne). 'over' = na/ponad limitem (grandfathering:
// istniejący nadmiar jest OK, ale nie da się dodać więcej), 'near' = ≤2 od limitu.
export function usageLevel(used: number, limit: number): UsageLevel {
  if (limit <= 0) return 'ok';
  if (used >= limit) return 'over';
  if (used >= limit - 2) return 'near';
  return 'ok';
}

export default function UsageMeter({
  used,
  freeLimit,
  premiumLimit,
  tier,
  billingOn,
  label,
}: {
  used: number;
  freeLimit: number;
  premiumLimit: number;
  tier: Tier;
  billingOn: boolean;
  label?: string; // opcjonalna nazwa zasobu (PL), np. „komend własnych"
}) {
  const { lang } = useLang();
  if (!billingOn) return null; // bez Stripe brak paywalla → brak nacisku na Premium
  const limit = tier === 'premium' ? premiumLimit : freeLimit;
  const lvl: UsageLevel = tier === 'free' ? usageLevel(used, freeLimit) : 'ok';
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const bar = lvl === 'over' ? 'bg-accent' : lvl === 'near' ? 'bg-amber-400' : 'bg-green-500/70';
  const tierLabel = tp(lang, tier === 'premium' ? 'ui.premium.pro' : 'ui.premium.free');

  return (
    <div className="space-y-2 rounded-xl border border-line bg-bg/30 p-3">
      <div className="flex items-center justify-between text-sm">
        {label ? <span className="font-semibold text-white/80">{label}</span> : <span />}
        <span className="tabular-nums text-muted">
          {used} / {limit} · {tierLabel}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>

      {tier === 'free' && lvl === 'over' && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-accent/40 bg-accent/5 p-3">
          <AlertTriangle size={16} className="shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white/90">
              {tp(lang, 'ui.limit.reached')}
            </div>
            <div className="text-xs text-muted">
              <Sparkles size={11} className="mb-0.5 me-1 inline text-accent" />
              {tp(lang, 'ui.premium.pro')}: {premiumLimit}
              {label ? ` ${label}` : ''}
            </div>
          </div>
          <PremiumDialog guildTier="free" />
        </div>
      )}

      {tier === 'free' && lvl === 'near' && (
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span>
            <AlertTriangle size={12} className="mb-0.5 me-1 inline text-amber-400" />
            {tp(lang, 'ui.limit.approaching')}
          </span>
          <PremiumDialog guildTier="free" />
        </div>
      )}
    </div>
  );
}
