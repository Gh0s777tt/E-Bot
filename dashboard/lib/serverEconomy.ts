// Faza 7 / F3 — ekonomia SERWERA (waluta natywna; osobno od GT z GH0ST w lib/economy.ts).
// Config w settings 'economy_config'; sklep w Supabase 'economy_shop'.
import { getRawSetting, setRawSetting } from './data';
import { getPrimaryGuildId } from './guild';
import { hasSupabase, supabase } from './supabase';

export type EconomyConfig = {
  enabled: boolean;
  currency: string;
  startBalance: number;
  dailyAmount: number;
  dailyStreakBonus: number;
  workMin: number;
  workMax: number;
  workCooldownMin: number;
  robEnabled: boolean;
  robChance: number;
  robCooldownMin: number;
  robMaxPercent: number;
  gambleEnabled: boolean;
  gambleMax: number;
  bankInterestPct: number;
  payTaxPct: number; // podatek od /eco pay (%)
  levelUpMoney: number; // nagroda pieniężna za awans poziomu (0 = wył.)
};

export const ECONOMY_DEFAULT: EconomyConfig = {
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

export async function getServerEconomy(): Promise<EconomyConfig> {
  const raw = await getRawSetting('economy_config');
  if (!raw) return { ...ECONOMY_DEFAULT };
  try {
    return { ...ECONOMY_DEFAULT, ...(JSON.parse(raw) as Partial<EconomyConfig>) };
  } catch {
    return { ...ECONOMY_DEFAULT };
  }
}

export async function saveServerEconomy(cfg: EconomyConfig): Promise<void> {
  await setRawSetting('economy_config', JSON.stringify(cfg));
}

// ── Sezon ekonomii (miesięczny top-eco + wypłata podium + opcjonalny reset) ──
export type EcoSeasonConfig = {
  enabled: boolean;
  channelId: string;
  reward1: number;
  reward2: number;
  reward3: number;
  reset: boolean;
};
export const ECO_SEASON_DEFAULT: EcoSeasonConfig = {
  enabled: false,
  channelId: '',
  reward1: 0,
  reward2: 0,
  reward3: 0,
  reset: false,
};

export async function getEcoSeason(): Promise<EcoSeasonConfig> {
  const raw = await getRawSetting('eco_season_config');
  if (!raw) return { ...ECO_SEASON_DEFAULT };
  try {
    return { ...ECO_SEASON_DEFAULT, ...(JSON.parse(raw) as Partial<EcoSeasonConfig>) };
  } catch {
    return { ...ECO_SEASON_DEFAULT };
  }
}

export async function saveEcoSeason(cfg: EcoSeasonConfig): Promise<void> {
  await setRawSetting('eco_season_config', JSON.stringify(cfg));
}

export type ShopItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  role_id: string | null;
  stock: number | null;
  effect: string | null;
  duration_days: number | null; // Etap J — rola czasowa (po tylu dniach bot ją zdejmie)
};

export async function getShopItems(): Promise<ShopItem[]> {
  if (!hasSupabase) return [];
  try {
    const gid = await getPrimaryGuildId();
    if (!gid) return [];
    const { data, error } = await supabase()
      .from('economy_shop')
      .select('id,name,description,price,role_id,stock,effect,duration_days')
      .eq('guild_id', gid)
      .order('price', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as ShopItem[];
  } catch {
    return [];
  }
}

export type ShopItemInput = {
  name: string;
  description?: string;
  price: number;
  role_id?: string;
  effect?: string;
  duration_days?: number;
};

export async function addShopItem(item: ShopItemInput): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabase) return { ok: false, error: 'Brak Supabase' };
  const gid = await getPrimaryGuildId();
  if (!gid) return { ok: false, error: 'Brak serwera' };
  const { error } = await supabase()
    .from('economy_shop')
    .insert([
      {
        guild_id: gid,
        name: item.name,
        description: item.description || null,
        price: item.price,
        role_id: item.role_id || null,
        effect: item.effect || null,
        duration_days: item.role_id && item.duration_days ? item.duration_days : null,
      },
    ]);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function removeShopItem(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabase) return { ok: false, error: 'Brak Supabase' };
  const { error } = await supabase().from('economy_shop').delete().eq('id', id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
