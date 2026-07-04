// Etap J (eko 2.0) — giełda. Wirtualne spółki z ceną liczoną DETERMINISTYCZNIE z czasu
// (suma sinusoid z fazami z hasza symbolu): brak workera w tle, cena spójna między odczytami,
// zawsze dodatnia, łagodnie falująca i wracająca do średniej. Pozycje graczy w Supabase
// economy_stocks (graceful no-op bez chmury). Time z Date.now() — bot runtime, nie workflow.
import {
  cloudDelete,
  cloudDeleteReturning,
  cloudSelect,
  cloudUpdateReturning,
  cloudUpsert,
  hasCloud,
} from '../lib/cloud.mts';

export type Stock = { symbol: string; name: string; emoji: string; base: number; vol: number };

// Spółki fikcyjne (tematyczne). vol = mnożnik zmienności (memy bujają mocniej).
export const STOCKS: Stock[] = [
  { symbol: 'GHOST', name: 'GH0ST Industries', emoji: '👻', base: 100, vol: 1.0 },
  { symbol: 'GEM', name: 'Gem Holdings', emoji: '💎', base: 500, vol: 0.45 },
  { symbol: 'BOT', name: 'BotCorp', emoji: '🤖', base: 150, vol: 0.8 },
  { symbol: 'PIZZA', name: 'Pizza Union', emoji: '🍕', base: 40, vol: 1.1 },
  { symbol: 'MOON', name: 'MoonShot', emoji: '🚀', base: 60, vol: 1.8 },
  { symbol: 'PEPE', name: 'Pepe Memes', emoji: '🐸', base: 25, vol: 2.2 },
];

export function findStock(sym: string): Stock | undefined {
  const s = sym.trim().toUpperCase();
  return STOCKS.find((x) => x.symbol === s);
}

// Deterministyczny hash → liczba [0,1) (faza sinusoidy dla symbolu+harmoniki).
function hash01(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

// Harmoniki: okresy w minutach + amplitudy. Suma amplitud < 0.5 → mnożnik bazowy dodatni;
// vol może go zwiększyć, stąd dolna klamra 0.15.
const WAVES = [
  { period: 37, amp: 0.05 },
  { period: 263, amp: 0.1 }, // ~4,4 h
  { period: 1259, amp: 0.14 }, // ~21 h
  { period: 5237, amp: 0.09 }, // ~3,6 dnia
];

// Cena symbolu w chwili `nowMs` (domyślnie teraz). Zawsze >= 1.
export function priceAt(stock: Stock, nowMs = Date.now()): number {
  const tMin = nowMs / 60_000;
  let mult = 1;
  for (let i = 0; i < WAVES.length; i++) {
    const w = WAVES[i];
    const phase = hash01(`${stock.symbol}:${i}`) * Math.PI * 2;
    mult += w.amp * stock.vol * Math.sin(tMin / w.period + phase);
  }
  return Math.max(1, Math.round(stock.base * Math.max(0.15, mult)));
}

// Zmiana % względem ceny sprzed `hoursAgo` godzin (domyślnie 24 h).
export function changePct(stock: Stock, hoursAgo = 24, nowMs = Date.now()): number {
  const past = priceAt(stock, nowMs - hoursAgo * 3_600_000);
  const now = priceAt(stock, nowMs);
  return past > 0 ? ((now - past) / past) * 100 : 0;
}

// ── Pozycje graczy ──
export type Holding = { symbol: string; shares: number; invested: number };

export async function getHoldings(guildId: string, userId: string): Promise<Holding[]> {
  if (!hasCloud()) return [];
  return cloudSelect<Holding>(
    'economy_stocks',
    `select=symbol,shares,invested&guild_id=eq.${guildId}&user_id=eq.${userId}&order=symbol.asc`,
  );
}

// Zmienia pozycję (read-modify-write). shares<=0 → kasuje wiersz. investedDelta: +koszt kupna / −część przy sprzedaży.
export async function adjustHolding(
  guildId: string,
  userId: string,
  symbol: string,
  sharesDelta: number,
  investedDelta: number,
): Promise<void> {
  if (!hasCloud()) return;
  const rows = await getHoldings(guildId, userId);
  const cur = rows.find((r) => r.symbol === symbol);
  const shares = (cur?.shares ?? 0) + sharesDelta;
  const invested = Math.max(0, Math.round((cur?.invested ?? 0) + investedDelta));
  if (shares <= 0) {
    await cloudDelete(
      'economy_stocks',
      `guild_id=eq.${guildId}&user_id=eq.${userId}&symbol=eq.${symbol}`,
    );
    return;
  }
  await cloudUpsert(
    'economy_stocks',
    [{ guild_id: guildId, user_id: userId, symbol, shares, invested }],
    'guild_id,user_id,symbol',
  );
}

// Atomowa SPRZEDAŻ pozycji (compare-and-swap): odejmij `shares` TYLKO jeśli w bazie wciąż jest
// dokładnie `expectedShares` (filtr `shares=eq`). Przy równoległej sprzedaży drugie wywołanie nie
// trafi w filtr → zwraca false (bez zmiany), więc wołający NIE wypłaca 2× (anty-lost-update, #2).
// newInvested = docelowa wartość `invested` po sprzedaży. Bez chmury → true (tryb lokalny).
// deps wstrzykiwalne dla testów (wzorzec saveConfig.fetchImpl) — domyślnie realne funkcje chmury.
export type SellDeps = {
  del: (table: string, filter: string) => Promise<unknown[]>;
  upd: (table: string, filter: string, patch: unknown) => Promise<unknown[]>;
};

// Czysty rdzeń CAS (bez gatingu chmury — testowalny). Zwraca true, gdy warunkowy zapis trafił
// (dokładnie `expectedShares` w bazie). left<=0 → kasuje wiersz, inaczej PATCH nowej wartości.
export async function sellHoldingCASCore(
  base: string,
  shares: number,
  expectedShares: number,
  newInvested: number,
  deps: SellDeps,
): Promise<boolean> {
  const left = expectedShares - shares;
  if (left <= 0) {
    const gone = await deps.del('economy_stocks', base);
    return gone.length > 0;
  }
  const updated = await deps.upd('economy_stocks', base, {
    shares: left,
    invested: Math.max(0, Math.round(newInvested)),
  });
  return updated.length > 0;
}

export async function sellHoldingCAS(
  guildId: string,
  userId: string,
  symbol: string,
  shares: number,
  expectedShares: number,
  newInvested: number,
  deps: SellDeps = { del: cloudDeleteReturning, upd: cloudUpdateReturning },
): Promise<boolean> {
  if (!hasCloud()) return true;
  const base = `guild_id=eq.${guildId}&user_id=eq.${userId}&symbol=eq.${symbol}&shares=eq.${expectedShares}`;
  return sellHoldingCASCore(base, shares, expectedShares, newInvested, deps);
}
