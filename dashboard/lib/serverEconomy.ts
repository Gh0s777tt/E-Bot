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

export type ShopItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  role_id: string | null;
  stock: number | null;
  effect: string | null;
};

export async function getShopItems(): Promise<ShopItem[]> {
  if (!hasSupabase) return [];
  try {
    const gid = await getPrimaryGuildId();
    if (!gid) return [];
    const { data, error } = await supabase()
      .from('economy_shop')
      .select('id,name,description,price,role_id,stock,effect')
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
      },
    ]);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function removeShopItem(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabase) return { ok: false, error: 'Brak Supabase' };
  const { error } = await supabase().from('economy_shop').delete().eq('id', id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
