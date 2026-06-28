// Server-side bramka limitów planu (#631). Liczby/komunikaty: premiumPlan.ts (klient-safe, jedno
// miejsce edycji). Tu wyłącznie egzekwowanie: tier AKTUALNEGO serwera (getGuildTier) + grandfathering.
// billing/guild importowane LAZY (guild ciągnie next/headers) — by importerzy i testy nie wciągały
// server-only łańcucha na top-level. Bez billingu (brak klucza Stripe) → zawsze przepuszcza: limity są
// formą paywalla, a bez Stripe nie paywall'ujemy (spójnie z canUsePlugin w billing.ts).
import { type LimitFeature, limitAllows, limitMessage, planLimit } from './premiumPlan';

export type LimitGuard = { ok: true } | { ok: false; error: string };

// Czy zapis listy/obiektu o docelowej liczbie `next` (obecnie zapisane: `current`) mieści się w planie
// aktualnego serwera. `current` umożliwia grandfathering (istniejące nadmiarowe zostają, nowe — nie).
// Fail-open: błąd billingu/sesji nie blokuje zapisu.
export async function guardLimit(
  feature: LimitFeature,
  next: number,
  current: number,
): Promise<LimitGuard> {
  try {
    const { billingEnabled, getGuildTier } = await import('./billing');
    if (!billingEnabled()) return { ok: true };
    const { getPrimaryGuildId } = await import('./guild');
    const tier = await getGuildTier(await getPrimaryGuildId());
    const limit = planLimit(feature, tier);
    if (limitAllows(limit, next, current)) return { ok: true };
    return { ok: false, error: limitMessage(feature, limit, tier) };
  } catch {
    return { ok: true };
  }
}
