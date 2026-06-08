// Katalog odznak — LUSTRO bot/src/community/badges.mts (id/emoji/name muszą się zgadzać).
// Panel używa tego do renderu realnych odznak na karcie profilu (zamiast samej liczby).
export type BadgeDef = { id: string; emoji: string; name: string };

export const BADGES: BadgeDef[] = [
  { id: 'lvl5', emoji: '🌱', name: 'Nowicjusz — poziom 5' },
  { id: 'lvl10', emoji: '⭐', name: 'Bywalec — poziom 10' },
  { id: 'lvl25', emoji: '🔥', name: 'Weteran — poziom 25' },
  { id: 'lvl50', emoji: '💎', name: 'Legenda — poziom 50' },
  { id: 'lvl100', emoji: '👑', name: 'Mistrz — poziom 100' },
  { id: 'prestige', emoji: '🏅', name: 'Prestiż' },
  { id: 'rich', emoji: '💰', name: 'Bogacz — 10 000' },
  { id: 'tycoon', emoji: '🤑', name: 'Krezus — 100 000' },
  { id: 'streak7', emoji: '📅', name: 'Wytrwały — streak 7 dni' },
  { id: 'streak30', emoji: '🗓️', name: 'Żelazny nawyk — 30 dni' },
  { id: 'inviter', emoji: '🤝', name: 'Rekruter — 5 zaproszeń' },
  { id: 'ambassador', emoji: '📣', name: 'Ambasador — 25 zaproszeń' },
  { id: 'gamer', emoji: '🎮', name: 'Pogromca gier — 10 ukończonych' },
];

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
