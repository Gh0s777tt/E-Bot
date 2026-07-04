// Discovery B4 (#684) — metryki subskrypcji dla właściciela. Problem: PremiumAdmin pokazywał
// stan, ale nie ostrzegał (wygasające) ani nie mierzył ruchu (nowe/wygasłe). Czysta funkcja na
// wierszach z listPremiumGuilds() — liczona client-side w PremiumAdmin (owner tool, PL, bez i18n).
// Uwaga do „Wygasłe": liczy tylko wiersze wciąż tier='premium' po dacie końca — odebrane ręcznie
// i skasowane subskrypcje Stripe wracają na tier='free' i znikają z listy (niedoszacowanie churnu).

export type PremiumMetricsRow = { since: string | null; until: string | null; active: boolean };

export type PremiumMetrics = {
  active: number;
  expiringSoon: number; // aktywne z datą końca ≤ EXPIRING_DAYS od teraz
  newLast30d: number; // start subskrypcji w ostatnich 30 dniach
  endedLast30d: number; // koniec (until) w ostatnich 30 dniach i już nieaktywne
};

export const EXPIRING_DAYS = 7;
const DAY_MS = 86_400_000;

// Dni do końca subskrypcji (sufit, min 0) albo null dla bezterminowej/braku daty.
export function daysLeft(until: string | null, now: number): number | null {
  if (!until) return null;
  const t = Date.parse(until);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.ceil((t - now) / DAY_MS));
}

export function computePremiumMetrics(rows: PremiumMetricsRow[], now: number): PremiumMetrics {
  const m: PremiumMetrics = { active: 0, expiringSoon: 0, newLast30d: 0, endedLast30d: 0 };
  const cutoff = now - 30 * DAY_MS;
  for (const r of rows) {
    if (r.active) {
      m.active++;
      const left = daysLeft(r.until, now);
      if (left !== null && left <= EXPIRING_DAYS) m.expiringSoon++;
    } else {
      const end = r.until ? Date.parse(r.until) : Number.NaN;
      if (!Number.isNaN(end) && end >= cutoff && end <= now) m.endedLast30d++;
    }
    const start = r.since ? Date.parse(r.since) : Number.NaN;
    if (!Number.isNaN(start) && start >= cutoff && start <= now) m.newLast30d++;
  }
  return m;
}
