// Faza 7 / F3 — warstwa danych ekonomii serwera (Supabase economy_users + economy_shop).
import { cloudDelete, cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';
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
