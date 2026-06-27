// Tryby dashboardu (3): Prosty / Zaawansowany / Developer. Filtrują widoczność elementów nawigacji
// (i docelowo zaawansowanych pól). Zapisywane per-użytkownik w localStorage. Czysty moduł (klient-safe).
export type ViewMode = 'simple' | 'adv' | 'dev';

// Próg widoczności elementu nawigacji: brak = „esencja" (zawsze widoczne), 'adv' = zaawansowane,
// 'dev' = tylko tryb Developer (narzędzia techniczne, klucze, audyt).
export type NavTier = 'adv' | 'dev';

export const DEFAULT_VIEW_MODE: ViewMode = 'adv';

const MODE_RANK: Record<ViewMode, number> = { simple: 0, adv: 1, dev: 2 };
const tierRank = (t?: NavTier): number => (t === 'dev' ? 2 : t === 'adv' ? 1 : 0);

// Czy element o danym progu jest widoczny w danym trybie.
export function tierVisible(tier: NavTier | undefined, mode: ViewMode): boolean {
  return tierRank(tier) <= MODE_RANK[mode];
}

// Pełna widoczność elementu nawigacji = próg trybu ORAZ uprawnienie. Elementy 'dev'
// (audyt/diagnostyka/integracje — powierzchnie INSTANCYJNE: IP, klucze, globalny config) widzi
// wyłącznie admin instancji, niezależnie od trybu widoku — sam tryb „Developer" to preferencja
// gęstości, NIE bramka bezpieczeństwa (klient może go przełączyć). Egzekucja serwerowa robi redirect;
// to chowa też linki, by nie były WIDOCZNE dla zwykłych użytkowników/klientów.
export function navItemVisible(
  tier: NavTier | undefined,
  mode: ViewMode,
  isAdmin: boolean,
): boolean {
  if (tier === 'dev' && !isAdmin) return false;
  return tierVisible(tier, mode);
}

export function isViewMode(v: string | null | undefined): v is ViewMode {
  return v === 'simple' || v === 'adv' || v === 'dev';
}

export const VIEW_MODES: { value: ViewMode; label: string; short: string; hint: string }[] = [
  {
    value: 'simple',
    label: 'Prosty',
    short: '🌸',
    hint: 'Tylko najważniejsze moduły — łatwy start',
  },
  {
    value: 'adv',
    label: 'Zaawansowany',
    short: '⚙️',
    hint: 'Wszystkie moduły — dla twórców serwerów',
  },
  {
    value: 'dev',
    label: 'Developer',
    short: '🛠️',
    hint: 'Pełny dostęp + narzędzia techniczne i klucze',
  },
];
