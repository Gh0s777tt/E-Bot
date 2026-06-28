// Wczytanie configu z surowego JSON-a ustawienia: scala zapisane pola (Partial) na defaulty. Pusty lub
// niepoprawny JSON → KOPIA defaultów (nigdy nie rzuca). Wycina powtarzany wzorzec
// `raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<T>) } : { ...DEFAULT }` z wielu modułów.
// UWAGA semantyczna: na błędzie parsowania ZWRACA defaulty — stosować TYLKO tam, gdzie taka semantyka
// jest pożądana (moduły „return-based"). Moduły „assignment + zostaw poprzedni" mają inną semantykę
// błędu i celowo NIE używają tego helpera.
export function mergeConfig<T extends object>(raw: string | null | undefined, defaults: T): T {
  if (!raw) return { ...defaults };
  try {
    return { ...defaults, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return { ...defaults };
  }
}
