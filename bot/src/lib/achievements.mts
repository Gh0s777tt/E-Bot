// Osiągnięcia-tiery oparte na poziomie levelingu. Wspólne dla /achievements i ogłoszeń w onLevelUp.
export type Tier = { key: string; emoji: string; level: number };

export const TIERS: Tier[] = [
  { key: 'novice', emoji: '🌱', level: 5 },
  { key: 'bronze', emoji: '🥉', level: 10 },
  { key: 'silver', emoji: '🥈', level: 25 },
  { key: 'gold', emoji: '🥇', level: 50 },
  { key: 'diamond', emoji: '💎', level: 100 },
  { key: 'legend', emoji: '👑', level: 200 },
];

// Tier dokładnie na danym poziomie (do ogłoszenia odznaki przy awansie).
export function tierAtLevel(level: number): Tier | undefined {
  return TIERS.find((tr) => tr.level === level);
}

// Następny tier powyżej danego poziomu (undefined = wszystkie zdobyte).
export function nextTier(level: number): Tier | undefined {
  return TIERS.find((tr) => tr.level > level);
}
