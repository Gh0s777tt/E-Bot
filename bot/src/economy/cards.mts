// Etap J (eko 2.0) — kolekcjonerskie karty (gacha). Losowanie kart o różnej rzadkości za walutę
// (sink), darmowe losowanie raz/20 h (hook), kolekcja z % ukończenia, sprzedaż duplikatów (źródło).
// Pula kart stała (emoji + nazwa neutralna; rzadkość lokalizowana). Dane w Supabase economy_cards
// + economy_card_daily (graceful no-op bez chmury). Math.random — bot runtime.
import { cloudDelete, cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type Card = { id: string; emoji: string; name: string; rarity: Rarity };

// Waga losowania, kolor embeda i wartość sprzedaży per rzadkość.
export const RARITY: Record<Rarity, { weight: number; color: number; sell: number; dot: string }> =
  {
    common: { weight: 50, color: 0x9e9e9e, sell: 50, dot: '⚪' },
    rare: { weight: 30, color: 0x3b82f6, sell: 150, dot: '🔵' },
    epic: { weight: 14, color: 0xa855f7, sell: 500, dot: '🟣' },
    legendary: { weight: 5, color: 0xf59e0b, sell: 2000, dot: '🟡' },
    mythic: { weight: 1, color: 0xe50914, sell: 10000, dot: '🔴' },
  };

export const CARDS: Card[] = [
  { id: 'ghostling', emoji: '👻', name: 'Ghostling', rarity: 'common' },
  { id: 'coin', emoji: '🪙', name: 'Lucky Coin', rarity: 'common' },
  { id: 'pad', emoji: '🎮', name: 'Gamepad', rarity: 'common' },
  { id: 'pizza', emoji: '🍕', name: 'Pizza Slice', rarity: 'common' },
  { id: 'crate', emoji: '📦', name: 'Loot Crate', rarity: 'common' },
  { id: 'blade', emoji: '🗡️', name: 'Shadow Blade', rarity: 'rare' },
  { id: 'shield', emoji: '🛡️', name: 'Aegis Shield', rarity: 'rare' },
  { id: 'potion', emoji: '🧪', name: 'Mana Potion', rarity: 'rare' },
  { id: 'guitar', emoji: '🎸', name: 'Riff Master', rarity: 'rare' },
  { id: 'hatchling', emoji: '🐉', name: 'Dragon Hatchling', rarity: 'epic' },
  { id: 'crown', emoji: '👑', name: 'Royal Crown', rarity: 'epic' },
  { id: 'orb', emoji: '🔮', name: 'Seer Orb', rarity: 'epic' },
  { id: 'rocket', emoji: '🚀', name: 'Star Rocket', rarity: 'epic' },
  { id: 'diamond', emoji: '💎', name: 'Eternal Diamond', rarity: 'legendary' },
  { id: 'bolt', emoji: '⚡', name: 'Thunder God', rarity: 'legendary' },
  { id: 'galaxy', emoji: '🌌', name: 'Galaxy Core', rarity: 'legendary' },
  { id: 'ghostking', emoji: '💀', name: 'GH0ST King', rarity: 'mythic' },
];

export const PULL_COST = 500;
export const DAILY_COOLDOWN_MIN = 1200; // 20 h

export function findCard(id: string): Card | undefined {
  return CARDS.find((c) => c.id === id.trim().toLowerCase());
}

const RARITY_ORDER: Rarity[] = ['mythic', 'legendary', 'epic', 'rare', 'common'];
export function rarityRank(r: Rarity): number {
  return RARITY_ORDER.indexOf(r);
}

// Losuje kartę: najpierw rzadkość wg wag, potem równomiernie wśród kart tej rzadkości.
export function drawCard(): Card {
  const total = Object.values(RARITY).reduce((a, r) => a + r.weight, 0);
  let roll = Math.random() * total;
  let chosen: Rarity = 'common';
  for (const [rar, def] of Object.entries(RARITY) as [Rarity, (typeof RARITY)[Rarity]][]) {
    roll -= def.weight;
    if (roll <= 0) {
      chosen = rar;
      break;
    }
  }
  const pool = CARDS.filter((c) => c.rarity === chosen);
  return pool[Math.floor(Math.random() * pool.length)] ?? CARDS[0];
}

// ── Kolekcja gracza ──
export type CardRow = { card_id: string; qty: number };

export async function getCollection(guildId: string, userId: string): Promise<CardRow[]> {
  if (!hasCloud()) return [];
  return cloudSelect<CardRow>(
    'economy_cards',
    `select=card_id,qty&guild_id=eq.${guildId}&user_id=eq.${userId}`,
  );
}

// Zmienia liczbę kart o `delta` (read-modify-write). qty<=0 → usuwa wiersz.
export async function addCard(
  guildId: string,
  userId: string,
  cardId: string,
  delta = 1,
): Promise<number> {
  if (!hasCloud()) return 0;
  const rows = await getCollection(guildId, userId);
  const qty = (rows.find((r) => r.card_id === cardId)?.qty ?? 0) + delta;
  if (qty <= 0) {
    await cloudDelete(
      'economy_cards',
      `guild_id=eq.${guildId}&user_id=eq.${userId}&card_id=eq.${cardId}`,
    );
    return 0;
  }
  await cloudUpsert(
    'economy_cards',
    [{ guild_id: guildId, user_id: userId, card_id: cardId, qty }],
    'guild_id,user_id,card_id',
  );
  return qty;
}

// ── Darmowe losowanie raz/dobę ──
type DailyRow = { last_pull: string };

export async function getCardDaily(guildId: string, userId: string): Promise<string | null> {
  if (!hasCloud()) return null;
  const rows = await cloudSelect<DailyRow>(
    'economy_card_daily',
    `select=last_pull&guild_id=eq.${guildId}&user_id=eq.${userId}`,
  );
  return rows[0]?.last_pull ?? null;
}

export async function setCardDaily(guildId: string, userId: string): Promise<void> {
  if (!hasCloud()) return;
  await cloudUpsert(
    'economy_card_daily',
    [{ guild_id: guildId, user_id: userId, last_pull: new Date().toISOString() }],
    'guild_id,user_id',
  );
}

export function minutesSinceIso(iso: string | null): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  return (Date.now() - Date.parse(iso)) / 60_000;
}
