// Plan Premium — dane do okna porównania (Free vs Premium). Ceny z env (sama prezentacja; realne kwoty
// w STRIPE_PRICE_ID / STRIPE_PRICE_ID_YEAR), by zmieniać je BEZ edycji kodu; nieustawione → "—".
// Cechy: etykiety przez i18n (ui.premium.feat.*), kolumny free/pro jako boolean (✓/✗). EDYTUJ
// PLAN_FEATURES, aby zmienić zawartość porównania.
import type { Tier } from './billing';

export const PREMIUM_PRICE_MONTH = process.env.NEXT_PUBLIC_PREMIUM_PRICE || '19,99 zł';
export const PREMIUM_PRICE_YEAR = process.env.NEXT_PUBLIC_PREMIUM_PRICE_YEAR || '199 zł';

export type PlanFeature = { key: string; free: boolean; pro: boolean };

// Kolejność = kolejność wierszy w tabeli. `core` jest w obu planach (pokazuje, że Free też coś daje).
export const PLAN_FEATURES: PlanFeature[] = [
  { key: 'ui.premium.feat.core', free: true, pro: true },
  { key: 'ui.premium.feat.plugins', free: false, pro: true },
  { key: 'ui.premium.feat.limits', free: false, pro: true },
  { key: 'ui.premium.feat.analytics', free: false, pro: true },
  { key: 'ui.premium.feat.priority', free: false, pro: true },
  { key: 'ui.premium.feat.branding', free: false, pro: true },
  { key: 'ui.premium.feat.early', free: false, pro: true },
];

// ── Limity liczby obiektów per plan ──────────────────────────────────────────
// JEDNO miejsce na liczby (anty-hardcode w handlerach). Egzekwowane server-side w planLimits.ts
// (guardLimit) TYLKO przy włączonym billingu — bez Stripe brak paywalla (spójnie z canUsePlugin).
//
// ZMIANA LIMITÓW: edytuj PLAN_LIMITS poniżej. Wartości premium są dobrane do twardych granic
// (Discord/walidacja Zod), więc podnosząc premium ponad cap trzeba też podnieść `.max()` w schemas.ts:
//   • customCommands/rolemenus → Zod .max() (rolemenus = 25 to twardy limit opcji selecta Discorda),
//   • responders/counters/scheduledPosts/reactionRoles → już równe Zod .max(), shopItems → DB (bez capu).
// Opcjonalnie pojedynczy próg nadpisuje env LIMIT_<FEATURE>_<TIER> (np. LIMIT_SHOPITEMS_FREE=20) —
// działa server-side (egzekwowanie); okno porównania pokazuje wartości ze stałej.
export type LimitFeature =
  | 'customCommands'
  | 'responders'
  | 'counters'
  | 'rolemenus'
  | 'reactionRoles'
  | 'scheduledPosts'
  | 'shopItems';

export const PLAN_LIMITS: Record<LimitFeature, Record<Tier, number>> = {
  customCommands: { free: 10, premium: 50 },
  responders: { free: 10, premium: 100 },
  counters: { free: 3, premium: 20 },
  rolemenus: { free: 5, premium: 25 },
  reactionRoles: { free: 10, premium: 100 },
  scheduledPosts: { free: 5, premium: 50 },
  shopItems: { free: 15, premium: 150 },
};

// Czytelne (PL) nazwy obiektów do komunikatu limitu (CLAUDE.md: komunikaty po polsku).
const LIMIT_LABEL_PL: Record<LimitFeature, string> = {
  customCommands: 'komend własnych',
  responders: 'auto-responderów',
  counters: 'liczników kanałów',
  rolemenus: 'opcji menu ról',
  reactionRoles: 'reakcji-ról',
  scheduledPosts: 'zaplanowanych postów',
  shopItems: 'przedmiotów w sklepie',
};

// Limit dla (funkcja, plan): env LIMIT_<FEATURE>_<TIER> (liczba ≥ 0, server-side) nadpisuje stałą.
export function planLimit(feature: LimitFeature, tier: Tier): number {
  const raw = process.env[`LIMIT_${feature.toUpperCase()}_${tier.toUpperCase()}`];
  const n = raw != null ? Number(raw) : Number.NaN;
  if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  return PLAN_LIMITS[feature][tier];
}

// Czy zapis o docelowej liczbie `next` jest dozwolony. Grandfathering: przekroczenie limitu jest OK
// tylko gdy NIE zwiększamy względem obecnego stanu (`current`) — istniejące nadmiarowe obiekty
// pozostają, ale nie można dodać kolejnych.
export function limitAllows(limit: number, next: number, current: number): boolean {
  return next <= limit || next <= current;
}

// Komunikat odmowy (PL) z liczbą i zachętą do Premium dla planu Free.
export function limitMessage(feature: LimitFeature, limit: number, tier: Tier): string {
  const label = LIMIT_LABEL_PL[feature];
  const base = `Osiągnięto limit planu ${tier === 'premium' ? 'Premium' : 'Free'}: maks. ${limit} ${label}.`;
  return tier === 'free' ? `${base} Przejdź na Premium, aby zwiększyć limit.` : base;
}
