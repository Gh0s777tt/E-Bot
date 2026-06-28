// Plan Premium — dane do strony/okna porównania (Free vs Premium). Cena z env
// NEXT_PUBLIC_PREMIUM_PRICE (np. "19 zł / mc"), by zmienić ją BEZ edycji kodu; gdy nieustawiona →
// placeholder "—". Cechy: etykiety przez i18n (klucze ui.premium.feat.*), kolumny free/pro jako
// boolean (✓/✗). EDYTUJ PLAN_FEATURES, aby zmienić zawartość porównania.
export const PREMIUM_PRICE = process.env.NEXT_PUBLIC_PREMIUM_PRICE || '—';

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
