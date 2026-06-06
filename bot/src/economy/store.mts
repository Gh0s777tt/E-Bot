// Faza 7 / F3 — warstwa danych ekonomii serwera (Supabase economy_users + economy_shop).
import { cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

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
};

export function ecoConfig(): EcoConfig {
  const raw = getSettings()['economy_config'];
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
    wallet: ecoConfig().startBalance,
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
