// Sekcja „Plan / Premium" w panelu (zakładka w /settings) — to, czego brakowało: po zalogowaniu
// widać AKTUALNY plan serwera (Free/Premium), datę końca (gdy nadane na czas), tabelę cech Free vs
// Premium i CTA. Działa też przy uśpionym billingu (bez Stripe): zamiast checkoutu pokazuje notkę
// „Premium nadaje właściciel". Server component (dane z DB); CTA = PremiumDialog (klient).
import { Check, Minus, Sparkles } from 'lucide-react';
import type { PremiumInfo } from '../lib/billing';
import { type PanelLocale, tp } from '../lib/panelI18n';
import { BILLING_PLANS, PLAN_FEATURES } from '../lib/premiumPlan';
import PremiumDialog from './PremiumDialog';

const day = (iso: string | null) => (iso ? iso.slice(0, 10) : null);

export default function PlanPanel({
  lang,
  info,
  billingOn,
}: {
  lang: PanelLocale;
  info: PremiumInfo;
  billingOn: boolean;
}) {
  const isPremium = info.tier === 'premium';

  return (
    <section className="panel-glow rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
        <Sparkles size={16} className="text-accent" /> {tp(lang, 'ui.plan.heading')}
      </h2>

      {/* Aktualny plan serwera */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-bg/40 p-4">
        <span className="text-sm text-muted">{tp(lang, 'ui.plan.current')}</span>
        <span
          className={`rounded-md px-2.5 py-1 text-sm font-bold ${isPremium ? 'bg-accent/20 text-accent ring-1 ring-accent/40' : 'bg-elevated text-white/80'}`}
        >
          {isPremium ? tp(lang, 'ui.premium.pro') : tp(lang, 'ui.premium.free')}
        </span>
        {isPremium && info.until && (
          <span className="text-sm text-muted">
            {tp(lang, 'ui.plan.until')} <b className="text-white">{day(info.until)}</b>
          </span>
        )}
        {isPremium && !info.until && (
          <span className="text-sm text-muted">{tp(lang, 'ui.plan.lifetime')}</span>
        )}
        {isPremium && info.source && (
          <span className="text-xs text-muted/70">
            ({info.source === 'stripe' ? 'Stripe' : tp(lang, 'ui.plan.manual')})
          </span>
        )}
      </div>

      {/* Free vs Premium — cechy */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg/40 p-4">
          <div className="text-sm font-semibold text-white/80">{tp(lang, 'ui.premium.free')}</div>
          <div className="mt-1 font-display text-xl text-white">
            {tp(lang, 'ui.premium.freePrice')}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {PLAN_FEATURES.map((f) => (
              <li
                key={f.key}
                className={`flex items-center gap-2 ${f.free ? 'text-white/80' : 'text-muted/60'}`}
              >
                {f.free ? (
                  <Check size={15} className="shrink-0 text-accent" />
                ) : (
                  <Minus size={15} className="shrink-0 text-muted/50" />
                )}{' '}
                {tp(lang, f.key)}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-accent/60 bg-accent/5 p-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-accent">
            <Sparkles size={14} /> {tp(lang, 'ui.premium.pro')}
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-display text-white">
            {BILLING_PLANS.map((p, i) => (
              <span key={p.id} className="whitespace-nowrap">
                {i > 0 && <span className="me-2 text-muted/50">·</span>}
                <span className="text-lg">{p.price}</span>
                <span className="ms-1 text-xs font-normal text-muted">
                  / {p.months} {tp(lang, 'ui.premium.moShort')}
                </span>
              </span>
            ))}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {PLAN_FEATURES.map((f) => (
              <li key={f.key} className="flex items-center gap-2 text-white/90">
                {f.pro ? (
                  <Check size={15} className="shrink-0 text-accent" />
                ) : (
                  <Minus size={15} className="shrink-0 text-muted/50" />
                )}{' '}
                {tp(lang, f.key)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA — adaptuje się do stanu billingu */}
      <div className="mt-4">
        {isPremium ? (
          <div className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-center text-sm font-semibold text-accent">
            {tp(lang, 'ui.premium.current')}
          </div>
        ) : billingOn ? (
          <PremiumDialog guildTier="free" />
        ) : (
          <p className="rounded-lg border border-line bg-bg/40 px-4 py-3 text-sm text-muted">
            {tp(lang, 'ui.plan.contactOwner')}
          </p>
        )}
      </div>
    </section>
  );
}
