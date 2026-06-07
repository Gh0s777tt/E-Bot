// Tor A1 — silnik odznak. Liczone z istniejących danych (poziom/ekonomia/zaproszenia/prestiż/
// streak/backlog) i UTRWALANE w 'user_badges' → permanentne (zostają nawet po resecie sezonu XP).
import { cloudInsert, cloudSelect, hasCloud } from '../lib/cloud.mts';

export type BadgeStats = {
  level: number;
  prestige: number;
  total: number; // wallet + bank
  dailyStreak: number;
  invites: number; // realne zaproszenia
  backlogDone: number;
};

export type Badge = { id: string; emoji: string; name: string; check: (s: BadgeStats) => boolean };

export const BADGES: Badge[] = [
  { id: 'lvl5', emoji: '🌱', name: 'Nowicjusz — poziom 5', check: (s) => s.level >= 5 },
  { id: 'lvl10', emoji: '⭐', name: 'Bywalec — poziom 10', check: (s) => s.level >= 10 },
  { id: 'lvl25', emoji: '🔥', name: 'Weteran — poziom 25', check: (s) => s.level >= 25 },
  { id: 'lvl50', emoji: '💎', name: 'Legenda — poziom 50', check: (s) => s.level >= 50 },
  { id: 'lvl100', emoji: '👑', name: 'Mistrz — poziom 100', check: (s) => s.level >= 100 },
  { id: 'prestige', emoji: '🏅', name: 'Prestiż', check: (s) => s.prestige >= 1 },
  { id: 'rich', emoji: '💰', name: 'Bogacz — 10 000', check: (s) => s.total >= 10_000 },
  { id: 'tycoon', emoji: '🤑', name: 'Krezus — 100 000', check: (s) => s.total >= 100_000 },
  { id: 'streak7', emoji: '📅', name: 'Wytrwały — streak 7 dni', check: (s) => s.dailyStreak >= 7 },
  { id: 'streak30', emoji: '🗓️', name: 'Żelazny nawyk — 30 dni', check: (s) => s.dailyStreak >= 30 },
  { id: 'inviter', emoji: '🤝', name: 'Rekruter — 5 zaproszeń', check: (s) => s.invites >= 5 },
  {
    id: 'ambassador',
    emoji: '📣',
    name: 'Ambasador — 25 zaproszeń',
    check: (s) => s.invites >= 25,
  },
  {
    id: 'gamer',
    emoji: '🎮',
    name: 'Pogromca gier — 10 ukończonych',
    check: (s) => s.backlogDone >= 10,
  },
];

const byId = new Map(BADGES.map((b) => [b.id, b]));

export async function getEarnedBadgeIds(guildId: string, userId: string): Promise<string[]> {
  if (!hasCloud()) return [];
  const rows = await cloudSelect<{ badge_id: string }>(
    'user_badges',
    `select=badge_id&guild_id=eq.${guildId}&user_id=eq.${userId}`,
  ).catch(() => [] as { badge_id: string }[]);
  return rows.map((r) => r.badge_id);
}

// Utrwala nowo zdobyte odznaki i zwraca pełną listę (utrwalone ∪ właśnie spełnione).
export async function syncBadges(
  guildId: string,
  userId: string,
  stats: BadgeStats,
): Promise<Badge[]> {
  const earned = new Set(await getEarnedBadgeIds(guildId, userId));
  const fresh = BADGES.filter((b) => b.check(stats) && !earned.has(b.id)).map((b) => b.id);
  if (fresh.length && hasCloud()) {
    await cloudInsert(
      'user_badges',
      fresh.map((id) => ({ guild_id: guildId, user_id: userId, badge_id: id })),
    ).catch(() => {});
    for (const id of fresh) earned.add(id);
  }
  return [...earned].map((id) => byId.get(id)).filter((b): b is Badge => Boolean(b));
}
