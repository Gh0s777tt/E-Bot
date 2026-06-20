// Retencja kohortowa — liczona z `member_cohorts` (bot zapisuje joined_at/left_at per-członka).
// „Z osób, które dołączyły, ilu przetrwało N dni." Liczone ELIGIBLE-BASED: do retencji D_n bierzemy
// tylko członków, których kohorta ma już ≥N dni (inaczej wynik byłby nieokreślony — censoring).
// Scoped do bieżącego serwera (chokepoint getPrimaryGuildId), spójnie z getActivitySeries — liczby
// pasują do trendów przyjść/odejść i NIE przeciekają między tenantami w trybie self-serve.
import { getPrimaryGuildId } from './guild';
import { hasSupabase, supabase } from './supabase';

const DAY = 86_400_000;

export type CohortWeek = { week: string; size: number; d7: number };
export type RetentionSummary = {
  d1: number;
  d7: number;
  d30: number;
  eligible1: number;
  eligible7: number;
  eligible30: number;
  total: number;
  cohorts: CohortWeek[];
};

const EMPTY: RetentionSummary = {
  d1: 0,
  d7: 0,
  d30: 0,
  eligible1: 0,
  eligible7: 0,
  eligible30: 0,
  total: 0,
  cohorts: [],
};

type Row = { joined: number; left: number | null };

// Klucz tygodnia = poniedziałek (UTC) tygodnia dołączenia, jako 'YYYY-MM-DD'.
function mondayKey(ms: number): string {
  const d = new Date(ms);
  const dow = (d.getUTCDay() + 6) % 7; // pon=0 … niedz=6
  const mon = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow));
  return mon.toISOString().slice(0, 10);
}

// Przetrwał D_n: jeszcze jest (left===null) albo odszedł nie wcześniej niż n dni po dołączeniu.
function survived(r: Row, n: number): boolean {
  return r.left === null || r.left - r.joined >= n * DAY;
}

export async function getCohortRetention(days = 90): Promise<RetentionSummary> {
  if (!hasSupabase) return EMPTY;
  try {
    const since = new Date(Date.now() - days * DAY).toISOString();
    const gid = await getPrimaryGuildId(); // scoped do bieżącego serwera (anty-przeciek tenantów)
    const { data, error } = await supabase()
      .from('member_cohorts')
      .select('joined_at,left_at')
      .eq('guild_id', gid)
      .gte('joined_at', since);
    if (error || !data || !data.length) return EMPTY;

    const now = Date.now();
    const rows: Row[] = (data as { joined_at: string; left_at: string | null }[])
      .map((r) => ({
        joined: Date.parse(r.joined_at),
        left: r.left_at ? Date.parse(r.left_at) : null,
      }))
      .filter((r) => Number.isFinite(r.joined));
    if (!rows.length) return EMPTY;

    const eligible = (r: Row, n: number) => now - r.joined >= n * DAY;
    const calc = (n: number) => {
      let elig = 0;
      let ret = 0;
      for (const r of rows) {
        if (!eligible(r, n)) continue;
        elig++;
        if (survived(r, n)) ret++;
      }
      return { elig, pct: elig ? Math.round((ret / elig) * 100) : 0 };
    };
    const c1 = calc(1);
    const c7 = calc(7);
    const c30 = calc(30);

    // Per-tydzień: rozmiar kohorty + retencja D7 (eligible-based w obrębie tygodnia) — do wykresu.
    const byWeek = new Map<string, { size: number; e7: number; r7: number }>();
    for (const r of rows) {
      const k = mondayKey(r.joined);
      const w = byWeek.get(k) ?? { size: 0, e7: 0, r7: 0 };
      w.size++;
      if (eligible(r, 7)) {
        w.e7++;
        if (survived(r, 7)) w.r7++;
      }
      byWeek.set(k, w);
    }
    const cohorts: CohortWeek[] = [...byWeek.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, w]) => ({ week, size: w.size, d7: w.e7 ? Math.round((w.r7 / w.e7) * 100) : 0 }));

    return {
      d1: c1.pct,
      d7: c7.pct,
      d30: c30.pct,
      eligible1: c1.elig,
      eligible7: c7.elig,
      eligible30: c30.elig,
      total: rows.length,
      cohorts,
    };
  } catch {
    return EMPTY;
  }
}
