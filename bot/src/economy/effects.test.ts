// Rygiel chwilowych efektów itemów (XP-boost, tarcza anty-rabunek) — czysta logika TTL w pamięci.
// Regresja = efekt żyje za długo/za krótko albo przecieka między userami: tarcza chroniłaby kogoś
// innego, a XP×2 trwałby wiecznie. Sercem jest GRANICA wygaśnięcia `exp < now` (ścisłe <):
// w momencie dokładnie exp efekt JESZCZE działa; dopiero po nim gaśnie i jest leniwie usuwany.
// Czas sterowany fałszywym zegarem (vi) → w pełni deterministyczne, mutation-proof.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activateEffect, hasEffect, xpMultiplier } from './effects.mts';

const G = 'g1';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
});
afterEach(() => {
  vi.useRealTimers();
});

describe('effects — aktywacja i odpytywanie', () => {
  it('świeżo aktywowany efekt jest aktywny', () => {
    activateEffect(G, 'u-fresh', 'shield', 1000);
    expect(hasEffect(G, 'u-fresh', 'shield')).toBe(true);
  });

  it('nieaktywowany efekt → false', () => {
    expect(hasEffect(G, 'u-none', 'shield')).toBe(false);
  });
});

describe('effects — granica TTL (exp < now, ścisłe <)', () => {
  it('dokładnie w momencie wygaśnięcia (now === exp) efekt JESZCZE działa', () => {
    activateEffect(G, 'u-edge', 'xp2', 1000); // exp = 0 + 1000 = 1000
    vi.setSystemTime(1000);
    expect(hasEffect(G, 'u-edge', 'xp2')).toBe(true); // 1000 < 1000 === false → nie wygasł
  });

  it('1 ms po wygaśnięciu efekt gaśnie', () => {
    activateEffect(G, 'u-exp', 'xp2', 1000);
    vi.setSystemTime(1001);
    expect(hasEffect(G, 'u-exp', 'xp2')).toBe(false);
  });

  it('przed wygaśnięciem nadal aktywny', () => {
    activateEffect(G, 'u-mid', 'shield', 1000);
    vi.setSystemTime(999);
    expect(hasEffect(G, 'u-mid', 'shield')).toBe(true);
  });
});

describe('effects — mnożnik XP', () => {
  it('×2 tylko gdy aktywny efekt "xp2"', () => {
    expect(xpMultiplier(G, 'u-xp')).toBe(1); // brak efektu
    activateEffect(G, 'u-xp', 'xp2', 1000);
    expect(xpMultiplier(G, 'u-xp')).toBe(2);
  });

  it('po wygaśnięciu "xp2" mnożnik wraca do 1', () => {
    activateEffect(G, 'u-xp2', 'xp2', 1000);
    vi.setSystemTime(1001);
    expect(xpMultiplier(G, 'u-xp2')).toBe(1);
  });

  it('inny efekt (shield) NIE daje mnożnika XP', () => {
    activateEffect(G, 'u-sh', 'shield', 1000);
    expect(xpMultiplier(G, 'u-sh')).toBe(1);
  });
});

describe('effects — izolacja klucza guild:user:effect', () => {
  it('efekt jednego usera nie przecieka na innego', () => {
    activateEffect(G, 'u-A', 'shield', 1000);
    expect(hasEffect(G, 'u-A', 'shield')).toBe(true);
    expect(hasEffect(G, 'u-B', 'shield')).toBe(false); // inny user
  });

  it('ten sam user na innym serwerze ma osobny efekt', () => {
    activateEffect('gX', 'u-iso', 'xp2', 1000);
    expect(hasEffect('gX', 'u-iso', 'xp2')).toBe(true);
    expect(hasEffect('gY', 'u-iso', 'xp2')).toBe(false); // inny guild
  });

  it('różne efekty tego samego usera są niezależne', () => {
    activateEffect(G, 'u-multi', 'xp2', 1000);
    expect(hasEffect(G, 'u-multi', 'xp2')).toBe(true);
    expect(hasEffect(G, 'u-multi', 'shield')).toBe(false); // inny effect
  });
});
