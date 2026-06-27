// Stałe/typy battle-passa współdzielone przez serwer I klient — BEZ importów server-only (bezpieczne
// w komponentach 'use client'). Zwierciadło drabiny z bota (bot/src/commands/battlepass.mts).
export type TierRole = { tier: number; roleId: string };

export const BP_TIERS: { tier: number; title: string }[] = [
  { tier: 1, title: '🌱 Rozgrzewka' },
  { tier: 2, title: '🔥 Rozkręcasz się' },
  { tier: 3, title: '⭐ Stały bywalec' },
  { tier: 4, title: '💪 Aktywny' },
  { tier: 5, title: '🚀 Napędowy' },
  { tier: 6, title: '👑 Filar społeczności' },
  { tier: 7, title: '🏆 Weteran sezonu' },
  { tier: 8, title: '🌟 Legenda sezonu' },
];
