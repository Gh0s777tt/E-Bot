'use client';

// Okno porównania planów Free vs Premium (M5/billing). Przycisk „Przejdź na Premium" → modal z dwiema
// kartami (cechy ✓/✗) + przełącznik miesięczny/roczny (roczny polecany, z plakietką oszczędności) →
// „Subskrybuj" startuje Stripe Checkout (/api/billing/checkout, plan w body). Gating w miejscu użycia.
import { Check, Minus, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { tp } from '../lib/panelI18n';
import { PLAN_FEATURES, PREMIUM_PRICE_MONTH, PREMIUM_PRICE_YEAR } from '../lib/premiumPlan';
import { useLang } from './LangContext';

export default function PremiumDialog({ guildTier = 'free' }: { guildTier?: 'free' | 'premium' }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<'month' | 'year'>('year'); // roczny domyślnie (polecany)
  const isPremium = guildTier === 'premium';

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  async function subscribe() {
    setBusy(true);
    try {
      const r = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const j = (await r.json()) as { url?: string };
      if (j.url) window.location.href = j.url;
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  const mark = (on: boolean) =>
    on ? (
      <Check size={15} className="text-accent" aria-hidden />
    ) : (
      <Minus size={15} className="text-muted/50" aria-hidden />
    );

  const segBtn = (p: 'month' | 'year', label: string) => (
    <button
      type="button"
      onClick={() => setPlan(p)}
      className={`rounded-md px-3 py-1 text-xs font-semibold transition ${plan === p ? 'bg-accent text-white' : 'text-muted hover:text-white'}`}
    >
      {label}
    </button>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-accent/50 bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent/20"
      >
        <Sparkles size={15} /> {tp(lang, 'ui.premium.cta')}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={tp(lang, 'ui.premium.later')}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={tp(lang, 'ui.premium.title')}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-card p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="✕"
              className="absolute end-4 top-4 text-muted transition hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-2xl text-white">{tp(lang, 'ui.premium.title')}</h2>
            <p className="mt-1 text-sm text-muted">{tp(lang, 'ui.premium.subtitle')}</p>

            {/* Przełącznik planu — wpływa na cenę i przycisk po stronie Premium. */}
            <div className="mt-4 inline-flex items-center gap-1 rounded-lg border border-line bg-bg/40 p-1">
              {segBtn('month', tp(lang, 'ui.premium.monthly'))}
              {segBtn('year', tp(lang, 'ui.premium.yearly'))}
              <span className="ms-1 rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                {tp(lang, 'ui.premium.yearSave')}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* Free */}
              <div className="flex flex-col rounded-xl border border-line bg-bg/40 p-4">
                <div className="text-sm font-semibold text-white/80">
                  {tp(lang, 'ui.premium.free')}
                </div>
                <div className="mt-1 font-display text-2xl text-white">
                  {tp(lang, 'ui.premium.freePrice')}
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {PLAN_FEATURES.map((f) => (
                    <li
                      key={f.key}
                      className={`flex items-center gap-2 ${f.free ? 'text-white/80' : 'text-muted/60'}`}
                    >
                      {mark(f.free)} {tp(lang, f.key)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium */}
              <div className="flex flex-col rounded-xl border border-accent/60 bg-accent/5 p-4">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-accent">
                  <Sparkles size={14} /> {tp(lang, 'ui.premium.pro')}
                </div>
                <div className="mt-1 font-display text-2xl text-white">
                  {plan === 'year' ? PREMIUM_PRICE_YEAR : PREMIUM_PRICE_MONTH}
                  <span className="ms-1 text-sm font-normal text-muted">
                    {plan === 'year'
                      ? tp(lang, 'ui.premium.perYear')
                      : tp(lang, 'ui.premium.month')}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {PLAN_FEATURES.map((f) => (
                    <li key={f.key} className="flex items-center gap-2 text-white/90">
                      {mark(f.pro)} {tp(lang, f.key)}
                    </li>
                  ))}
                </ul>
                {isPremium ? (
                  <div className="mt-5 rounded-lg border border-accent/40 bg-accent/10 py-2 text-center text-sm font-semibold text-accent">
                    {tp(lang, 'ui.premium.current')}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={subscribe}
                    disabled={busy}
                    className="mt-5 rounded-lg bg-accent py-2 text-center text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
                  >
                    {tp(lang, 'ui.premium.subscribe')}
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full text-center text-xs text-muted transition hover:text-white"
            >
              {tp(lang, 'ui.premium.later')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
