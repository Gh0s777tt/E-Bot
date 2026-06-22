// Rygiel odznak panelu (nextBadges · resolveBadges · badgeById) + SPÓJNOŚĆ cross-package z botem.
// badges.ts to LUSTRO bot/src/community/badges.mts — id muszą się zgadzać, inaczej panel renderuje
// odznaki, których bot nie nadaje (lub gubi nowe). nextBadges napędza „najbliższe do zdobycia" na profilu.
// Bot czytany jako TEKST (dashboard tsc nie importuje `.mts` z bot/).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BADGES, type BadgeMetric, badgeById, nextBadges, resolveBadges } from './badges';

const metrics = (over: Partial<Record<BadgeMetric, number>> = {}): Record<BadgeMetric, number> => ({
  level: 0,
  total: 0,
  streak: 0,
  invites: 0,
  ...over,
});

describe('nextBadges — najbliższe do zdobycia', () => {
  it('sortuje malejąco wg % postępu; pomija bez metryki/need', () => {
    const out = nextBadges([], metrics({ level: 3 }), 20);
    expect(out[0].id).toBe('lvl5'); // 3/5 = 60% → najwyżej
    expect(out[0].pct).toBe(60);
    expect(out.some((b) => b.id === 'prestige')).toBe(false); // brak metric/need
    expect(out.some((b) => b.id === 'gamer')).toBe(false);
  });

  it('pomija już zdobyte (ownedIds)', () => {
    const out = nextBadges(['lvl5'], metrics({ level: 3 }));
    expect(out.some((b) => b.id === 'lvl5')).toBe(false);
  });

  it('RYGIEL: pomija osiągnięte (cur >= need — ścisłe „już zdobyte")', () => {
    const out = nextBadges([], metrics({ level: 5 }), 20);
    expect(out.some((b) => b.id === 'lvl5')).toBe(false); // 5>=5 → osiągnięte, nie „następne"
  });

  it('pct = round(cur/need*100); limit przycina liczbę', () => {
    expect(nextBadges([], metrics({ level: 12 }), 20).find((b) => b.id === 'lvl25')?.pct).toBe(48);
    expect(nextBadges([], metrics({ level: 1 }), 3)).toHaveLength(3); // default-ish limit
  });
});

describe('resolveBadges / badgeById', () => {
  it('resolveBadges: id → definicje w kolejności katalogu, pomija nieznane', () => {
    expect(resolveBadges(['rich', 'lvl5', 'nie-ma']).map((b) => b.id)).toEqual(['lvl5', 'rich']);
  });
  it('badgeById: znane → def, nieznane → undefined', () => {
    expect(badgeById('tycoon')?.need).toBe(100_000);
    expect(badgeById('nie-ma')).toBeUndefined();
  });
});

describe('SPÓJNOŚĆ cross-package: id odznak panel ↔ bot', () => {
  it('zbiór id panelu = zbiór id bota (lustro się nie rozjeżdża)', () => {
    const src = readFileSync(
      join(import.meta.dirname, '..', '..', 'bot', 'src', 'community', 'badges.mts'),
      'utf8',
    );
    const block = /export const BADGES:[^[]*\[([\s\S]*?)\];/.exec(src);
    if (!block) throw new Error('Nie znaleziono BADGES w badges.mts');
    const botIds = new Set([...block[1].matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]));
    expect(botIds.size).toBe(13); // sanity
    expect(new Set(BADGES.map((b) => b.id))).toEqual(botIds);
  });
});
