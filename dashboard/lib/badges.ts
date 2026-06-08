// Katalog odznak — LUSTRO bot/src/community/badges.mts (id/emoji/name muszą się zgadzać).
// Panel używa tego do renderu realnych odznak na karcie profilu + progresu do kolejnych.
// metric/need = z czego liczyć postęp (jeśli da się policzyć z danych karty profilu).
export type BadgeMetric = 'level' | 'total' | 'streak' | 'invites';
export type BadgeDef = {
  id: string;
  emoji: string;
  name: string;
  metric?: BadgeMetric;
  need?: number;
};

export const BADGES: BadgeDef[] = [
  { id: 'lvl5', emoji: '🌱', name: 'Nowicjusz — poziom 5', metric: 'level', need: 5 },
  { id: 'lvl10', emoji: '⭐', name: 'Bywalec — poziom 10', metric: 'level', need: 10 },
  { id: 'lvl25', emoji: '🔥', name: 'Weteran — poziom 25', metric: 'level', need: 25 },
  { id: 'lvl50', emoji: '💎', name: 'Legenda — poziom 50', metric: 'level', need: 50 },
  { id: 'lvl100', emoji: '👑', name: 'Mistrz — poziom 100', metric: 'level', need: 100 },
  { id: 'prestige', emoji: '🏅', name: 'Prestiż' },
  { id: 'rich', emoji: '💰', name: 'Bogacz — 10 000', metric: 'total', need: 10_000 },
  { id: 'tycoon', emoji: '🤑', name: 'Krezus — 100 000', metric: 'total', need: 100_000 },
  { id: 'streak7', emoji: '📅', name: 'Wytrwały — streak 7 dni', metric: 'streak', need: 7 },
  { id: 'streak30', emoji: '🗓️', name: 'Żelazny nawyk — 30 dni', metric: 'streak', need: 30 },
  { id: 'inviter', emoji: '🤝', name: 'Rekruter — 5 zaproszeń', metric: 'invites', need: 5 },
  { id: 'ambassador', emoji: '📣', name: 'Ambasador — 25 zaproszeń', metric: 'invites', need: 25 },
  { id: 'gamer', emoji: '🎮', name: 'Pogromca gier — 10 ukończonych' },
];

// Najbliższe do zdobycia (niezdobyte, policzalne, jeszcze nieosiągnięte) — posortowane wg % postępu.
export function nextBadges(
  ownedIds: string[],
  metrics: Record<BadgeMetric, number>,
  limit = 3,
): { id: string; emoji: string; name: string; cur: number; need: number; pct: number }[] {
  const owned = new Set(ownedIds);
  const out: { id: string; emoji: string; name: string; cur: number; need: number; pct: number }[] =
    [];
  for (const b of BADGES) {
    if (owned.has(b.id) || !b.metric || !b.need) continue;
    const cur = metrics[b.metric];
    if (cur >= b.need) continue;
    out.push({
      id: b.id,
      emoji: b.emoji,
      name: b.name,
      cur,
      need: b.need,
      pct: Math.min(100, Math.round((cur / b.need) * 100)),
    });
  }
  return out.sort((a, b) => b.pct - a.pct).slice(0, limit);
}

export const BADGE_COUNT = BADGES.length;

const BY_ID = new Map(BADGES.map((b) => [b.id, b]));

// Mapuje zdobyte id → pełne definicje (w kolejności katalogu), pomija nieznane.
export function resolveBadges(ids: string[]): BadgeDef[] {
  const owned = new Set(ids);
  return BADGES.filter((b) => owned.has(b.id));
}

export function badgeById(id: string): BadgeDef | undefined {
  return BY_ID.get(id);
}
