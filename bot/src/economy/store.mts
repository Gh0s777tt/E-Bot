// Faza 7 / F3 — warstwa danych ekonomii serwera (Supabase economy_users + economy_shop).
import { cloudDelete, cloudRpc, cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';

export type EcoConfig = {
  enabled: boolean;
  currency: string;
  startBalance: number;
  dailyAmount: number;
  dailyStreakBonus: number;
  workMin: number;
  workMax: number;
  workCooldownMin: number;
  robEnabled: boolean;
  robChance: number; // %
  robCooldownMin: number;
  robMaxPercent: number; // % portfela ofiary
  gambleEnabled: boolean;
  gambleMax: number;
  bankInterestPct: number; // dzienne odsetki od salda w banku (% , 0 = wyłączone)
  payTaxPct: number; // podatek od /eco pay (%, 0 = brak) — spalany, nie trafia do nikogo
  levelUpMoney: number; // nagroda pieniężna za awans poziomu (0 = wyłączone)
};

export const ECO_DEFAULT: EcoConfig = {
  enabled: false,
  currency: '🪙',
  startBalance: 100,
  dailyAmount: 250,
  dailyStreakBonus: 50,
  workMin: 50,
  workMax: 300,
  workCooldownMin: 60,
  robEnabled: true,
  robChance: 35,
  robCooldownMin: 120,
  robMaxPercent: 30,
  gambleEnabled: true,
  gambleMax: 10000,
  bankInterestPct: 0,
  payTaxPct: 0,
  levelUpMoney: 0,
};

// Etap K — config ekonomii PER-SERWER: czytany świeżo dla danego serwera (komendy = niska
// częstotliwość). getGuildSettings nadpisuje globalny economy_config override'em serwera (fallback).
export function ecoConfig(guildId: string): EcoConfig {
  const raw = getGuildSettings(guildId)['economy_config'];
  try {
    return raw
      ? { ...ECO_DEFAULT, ...(JSON.parse(raw) as Partial<EcoConfig>) }
      : { ...ECO_DEFAULT };
  } catch {
    return { ...ECO_DEFAULT };
  }
}

// ── Kamienie milowe serii dziennej (/eco daily) — extra bonus w dniu osiągnięcia progu ──────────
// Mnożnik bazowego dailyAmount, przyznawany RAZ dokładnie gdy streak == day (czysta funkcja → test).
// Nagradza konsekwencję mocniej niż liniowy streak-bonus; po przerwaniu serii progi można zdobyć znów.
export const STREAK_MILESTONES: { day: number; mult: number }[] = [
  { day: 7, mult: 2 },
  { day: 14, mult: 3 },
  { day: 30, mult: 5 },
  { day: 60, mult: 8 },
  { day: 100, mult: 12 },
];

export function streakMilestoneBonus(
  streak: number,
  base: number,
): { bonus: number; mult: number } {
  const m = STREAK_MILESTONES.find((x) => x.day === streak);
  return m
    ? { bonus: Math.max(0, Math.round(base * m.mult)), mult: m.mult }
    : { bonus: 0, mult: 0 };
}

export type EcoUser = {
  guild_id: string;
  user_id: string;
  username: string;
  wallet: number;
  bank: number;
  last_daily: string | null;
  daily_streak: number;
  last_work: string | null;
  last_rob: string | null;
};

export async function getUser(guildId: string, userId: string): Promise<EcoUser> {
  const def: EcoUser = {
    guild_id: guildId,
    user_id: userId,
    username: '',
    wallet: ecoConfig(guildId).startBalance,
    bank: 0,
    last_daily: null,
    daily_streak: 0,
    last_work: null,
    last_rob: null,
  };
  if (!hasCloud()) return def;
  const rows = await cloudSelect<EcoUser>(
    'economy_users',
    `select=*&guild_id=eq.${guildId}&user_id=eq.${userId}`,
  );
  return rows[0] ? { ...def, ...rows[0] } : def;
}

export async function saveUser(
  u: Partial<EcoUser> & { guild_id: string; user_id: string },
): Promise<void> {
  if (!hasCloud()) return;
  await cloudUpsert(
    'economy_users',
    [{ ...u, updated_at: new Date().toISOString() }],
    'guild_id,user_id',
  );
}

// ── Atomowe operacje salda (anty-wyścig). Preferują RPC Postgres (economy_spend/credit/move) — debet/ruch
// robiony ATOMOWO w bazie (UPDATE ... WHERE wallet>=amount). Fallback do read-modify-write gdy RPC
// niewgrane/niedostępne; wtedy serializację per-user zapewnia withLock w handlerze. ──

// Odejmij `amount` z portfela JEŚLI wystarcza. Zwraca nowe saldo lub null (za mało / brak środków).
export async function spendWallet(
  guildId: string,
  userId: string,
  amount: number,
): Promise<number | null> {
  if (!Number.isInteger(amount) || amount <= 0) return null;
  try {
    const w = await cloudRpc<number | null>('economy_spend', {
      p_guild: guildId,
      p_user: userId,
      p_amount: amount,
    });
    return typeof w === 'number' ? w : null; // null = za mało (RPC zadziałało); number = nowe saldo
  } catch {
    const u = await getUser(guildId, userId);
    if (u.wallet < amount) return null;
    await saveUser({ guild_id: guildId, user_id: userId, wallet: u.wallet - amount });
    return u.wallet - amount;
  }
}

// Dodaj `amount` do portfela (upsert). Zwraca nowe saldo. `username` aktualizuje tylko gdy niepusty.
export async function creditWallet(
  guildId: string,
  userId: string,
  username: string,
  amount: number,
): Promise<number> {
  if (!Number.isInteger(amount) || amount <= 0) return (await getUser(guildId, userId)).wallet;
  try {
    const w = await cloudRpc<number | null>('economy_credit', {
      p_guild: guildId,
      p_user: userId,
      p_username: username,
      p_amount: amount,
    });
    if (typeof w === 'number') return w;
    throw new Error('rpc null');
  } catch {
    const u = await getUser(guildId, userId);
    await saveUser({ guild_id: guildId, user_id: userId, username, wallet: u.wallet + amount });
    return u.wallet + amount;
  }
}

// Ruch portfel↔bank: amount>0 = wpłata (portfel→bank), <0 = wypłata (bank→portfel). Zwraca nowe saldo
// portfela lub null (za mało po stronie źródła).
export async function moveBank(
  guildId: string,
  userId: string,
  amount: number,
): Promise<number | null> {
  if (!Number.isInteger(amount) || amount === 0) return null;
  try {
    const w = await cloudRpc<number | null>('economy_move', {
      p_guild: guildId,
      p_user: userId,
      p_amount: amount,
    });
    return typeof w === 'number' ? w : null;
  } catch {
    const u = await getUser(guildId, userId);
    if (amount > 0 ? u.wallet < amount : u.bank < -amount) return null;
    await saveUser({
      guild_id: guildId,
      user_id: userId,
      wallet: u.wallet - amount,
      bank: u.bank + amount,
    });
    return u.wallet - amount;
  }
}

// Idempotentnie materializuje konto ze startowym saldem (utwórz wiersz tylko jeśli go nie ma — NIGDY nie
// nadpisuje istniejącego salda). Potrzebne przed atomowym debetem (spendWallet) dla „dziewiczego" usera:
// getUser zwraca wirtualne startBalance bez wiersza, ale economy_spend (UPDATE … WHERE) nie trafiłby w nic
// → fałszywe „za mało". Używane w /eco pay (nadawca) i /eco rob (ofiara, rabuś-mandat).
export async function ensureUser(guildId: string, userId: string, username: string): Promise<void> {
  if (!hasCloud()) return;
  const start = ecoConfig(guildId).startBalance;
  try {
    await cloudRpc('economy_ensure', {
      p_guild: guildId,
      p_user: userId,
      p_username: username,
      p_start: start,
    });
  } catch {
    // Fallback (RPC niewgrane): utwórz wiersz tylko gdy go brak (nie nadpisuj istniejącego salda).
    const rows = await cloudSelect<{ user_id: string }>(
      'economy_users',
      `select=user_id&guild_id=eq.${guildId}&user_id=eq.${userId}`,
    );
    if (!rows[0]) await saveUser({ guild_id: guildId, user_id: userId, username, wallet: start });
  }
}

// ── Czysta arytmetyka transferów (pay/rob) — testowalna jednostkowo, używana przez handler /eco ──

// /eco pay: podatek (payTaxPct% kwoty, zaokrąglony w dół, „spalany") i kwota netto dla odbiorcy.
export function payAmounts(amount: number, taxPct: number): { tax: number; received: number } {
  const tax = Math.floor((Math.max(0, amount) * Math.max(0, taxPct)) / 100);
  return { tax, received: Math.max(0, amount - tax) };
}

// /eco rob: łup = robMaxPercent% portfela ofiary (w dół, nigdy ujemny).
export function robLoot(victimWallet: number, maxPercent: number): number {
  return Math.max(0, Math.floor((Math.max(0, victimWallet) * Math.max(0, maxPercent)) / 100));
}

// /eco rob (porażka): mandat = połowa workMax, lecz nie więcej niż saldo rabusia (nigdy ujemny).
export function robFine(robberWallet: number, workMax: number): number {
  return Math.min(Math.max(0, robberWallet), Math.floor(Math.max(0, workMax) / 2));
}

export type ShopItem = {
  id: string;
  guild_id: string;
  name: string;
  description: string | null;
  price: number;
  role_id: string | null;
  stock: number | null;
  effect: string | null; // '', 'xp2', 'shield', 'lootbox' (Tor B — itemy z efektem)
  duration_days: number | null; // Etap J — rola czasowa: po tylu dniach bot ją zdejmie (null/0 = na stałe)
};

export async function getShop(guildId: string): Promise<ShopItem[]> {
  if (!hasCloud()) return [];
  return cloudSelect<ShopItem>('economy_shop', `select=*&guild_id=eq.${guildId}&order=price.asc`);
}

export function fmt(n: number, cur: string): string {
  return `**${Math.round(n).toLocaleString('pl-PL')}** ${cur}`;
}

export function minutesSince(iso: string | null): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  return (Date.now() - Date.parse(iso)) / 60_000;
}

// ── Inwentarz (Tor 4) — przedmioty sklepowe BEZ roli trafiają tu zamiast nadawać rolę ──
export type InvRow = { item_name: string; qty: number };

export async function getInventory(guildId: string, userId: string): Promise<InvRow[]> {
  if (!hasCloud()) return [];
  return cloudSelect<InvRow>(
    'economy_inventory',
    `select=item_name,qty&guild_id=eq.${guildId}&user_id=eq.${userId}&order=item_name.asc`,
  );
}

// Zmienia ilość przedmiotu o `delta` (read-modify-write). qty<=0 → usuwa wiersz.
export async function addInventory(
  guildId: string,
  userId: string,
  itemName: string,
  delta = 1,
): Promise<void> {
  if (!hasCloud()) return;
  const rows = await getInventory(guildId, userId);
  const qty = (rows.find((r) => r.item_name === itemName)?.qty ?? 0) + delta;
  if (qty <= 0) {
    await cloudDelete(
      'economy_inventory',
      `guild_id=eq.${guildId}&user_id=eq.${userId}&item_name=eq.${encodeURIComponent(itemName)}`,
    );
    return;
  }
  await cloudUpsert(
    'economy_inventory',
    [{ guild_id: guildId, user_id: userId, item_name: itemName, qty }],
    'guild_id,user_id,item_name',
  );
}
