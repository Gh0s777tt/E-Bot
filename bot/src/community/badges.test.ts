// Rygiel progów odznak (BADGES) — czyste predykaty `check(stats)`. Odznaki są PERMANENTNE
// (utrwalane w 'user_badges', zostają po resecie sezonu), więc off-by-one w progu = ktoś
// dostaje/traci odznakę na zawsze niesłusznie. Każdy próg to ścisłe `>=`: dokładnie na progu
// odznaka wpada, jeden poniżej — nie. Każdy predykat patrzy WYŁĄCZNIE na swój wymiar statystyk.
import { describe, expect, it } from 'vitest';
import { BADGES, type BadgeStats } from './badges.mts';

const ZERO: BadgeStats = {
  level: 0,
  prestige: 0,
  total: 0,
  dailyStreak: 0,
  invites: 0,
  backlogDone: 0,
};

const byId = (id: string) => {
  const b = BADGES.find((x) => x.id === id);
  if (!b) throw new Error(`brak odznaki ${id} w teście`);
  return b;
};

// Tabela: [id odznaki, pole statystyki, dokładny próg].
const THRESHOLDS: [string, keyof BadgeStats, number][] = [
  ['lvl5', 'level', 5],
  ['lvl10', 'level', 10],
  ['lvl25', 'level', 25],
  ['lvl50', 'level', 50],
  ['lvl100', 'level', 100],
  ['prestige', 'prestige', 1],
  ['rich', 'total', 10_000],
  ['tycoon', 'total', 100_000],
  ['streak7', 'dailyStreak', 7],
  ['streak30', 'dailyStreak', 30],
  ['inviter', 'invites', 5],
  ['ambassador', 'invites', 25],
  ['gamer', 'backlogDone', 10],
];

describe('badges — integralność listy', () => {
  it('13 odznak, każda z id/emoji/name/check', () => {
    expect(BADGES).toHaveLength(13);
    for (const b of BADGES) {
      expect(b.id).toBeTruthy();
      expect(b.emoji).toBeTruthy();
      expect(b.name).toBeTruthy();
      expect(typeof b.check).toBe('function');
    }
  });

  it('id-y są unikalne', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });

  it('tabela progów pokrywa KOMPLET odznak (anti-rozjazd test↔produkcja)', () => {
    expect(new Set(THRESHOLDS.map((t) => t[0]))).toEqual(new Set(BADGES.map((b) => b.id)));
  });
});

describe('badges — dokładne progi (ścisłe >=)', () => {
  for (const [id, field, threshold] of THRESHOLDS) {
    it(`${id}: ${field} ${threshold - 1} → nie, ${threshold} → tak`, () => {
      const badge = byId(id);
      expect(badge.check({ ...ZERO, [field]: threshold - 1 })).toBe(false);
      expect(badge.check({ ...ZERO, [field]: threshold })).toBe(true);
      expect(badge.check({ ...ZERO, [field]: threshold + 1 })).toBe(true); // monotoniczność w górę
    });
  }
});

describe('badges — izolacja wymiaru (predykat patrzy tylko na swoje pole)', () => {
  it('odznaka levelowa nie wpada od kasy/zaproszeń', () => {
    const fat: BadgeStats = { ...ZERO, total: 1_000_000, invites: 1000, backlogDone: 1000 };
    expect(byId('lvl5').check(fat)).toBe(false);
    expect(byId('lvl100').check(fat)).toBe(false);
  });

  it('odznaka majątkowa nie wpada od poziomu/streaka', () => {
    const high: BadgeStats = { ...ZERO, level: 100, dailyStreak: 365, prestige: 9 };
    expect(byId('rich').check(high)).toBe(false);
    expect(byId('tycoon').check(high)).toBe(false);
  });

  it('odznaka za zaproszenia nie wpada od ukończonych gier', () => {
    expect(byId('inviter').check({ ...ZERO, backlogDone: 1000 })).toBe(false);
    expect(byId('ambassador').check({ ...ZERO, backlogDone: 1000 })).toBe(false);
  });
});
