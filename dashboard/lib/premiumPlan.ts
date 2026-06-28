// Plan Premium — dane do okna porównania (Free vs Premium). Ceny z env (sama prezentacja; realne kwoty
// w STRIPE_PRICE_ID / STRIPE_PRICE_ID_YEAR), by zmieniać je BEZ edycji kodu; nieustawione → "—".
// Cechy: etykiety przez i18n (ui.premium.feat.*), kolumny free/pro jako boolean (✓/✗). EDYTUJ
// PLAN_FEATURES, aby zmienić zawartość porównania.
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
