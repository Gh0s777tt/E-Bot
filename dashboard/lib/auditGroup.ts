// Czysta logika grupowania wpisów audytu po DNIU — klient-safe (zero importów serwerowych), by
// dziennik zmian dało się zwinąć i nie przewijać w nieskończoność. Dzień = pierwsze 10 znaków ISO
// `created_at` (YYYY-MM-DD; stabilne dla znaczników z Supabase). Grupy w kolejności pierwszego
// wystąpienia (wejście jest już posortowane malejąco → najnowszy dzień na górze); wpisy w obrębie
// dnia zachowują kolejność wejścia. Brak `created_at` → koszyk 'unknown' (nie gubimy wpisu).
export type AuditDayGroup<T> = { day: string; entries: T[] };

export function groupAuditByDay<T extends { created_at?: string }>(
  entries: T[],
): AuditDayGroup<T>[] {
  const order: string[] = [];
  const byDay = new Map<string, T[]>();
  for (const e of entries) {
    const day = (e.created_at ?? '').slice(0, 10) || 'unknown';
    let bucket = byDay.get(day);
    if (!bucket) {
      bucket = [];
      byDay.set(day, bucket);
      order.push(day);
    }
    bucket.push(e);
  }
  return order.map((day) => ({ day, entries: byDay.get(day) ?? [] }));
}
