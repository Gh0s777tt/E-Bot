// Rygiel ekonomii petów — części dotąd NIEpokryte (economy-math.test.ts pokrył bar/fullness/petLevel/
// moodKey/xpIntoLevel): wartość prezentu (giftValue = źródło dochodu pet), kap MAX_LEVEL, katalog
// SPECIES, findSpecies. Regresja giftValue = pet wypłaca za dużo/za mało (psucie balansu eko 2.0).
// Sytość zależy od Date.now → fałszywy zegar (vi) czyni giftValue w pełni deterministycznym.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findSpecies, giftValue, type Pet, petLevel, SPECIES, type Species } from './pets.mts';

const NOW = '2026-06-22T12:00:00.000Z';
const sp = (id: string): Species => {
  const s = findSpecies(id);
  if (!s) throw new Error(`brak gatunku ${id}`);
  return s;
};
// Pet z zadanym xp i znacznikiem ostatniego karmienia.
const pet = (xp: number, lastFed: string | null): Pet => ({
  guild_id: 'g',
  user_id: 'u',
  species: 'hamster',
  name: 'X',
  xp,
  last_fed: lastFed,
  last_gift: null,
});

describe('SPECIES — integralność katalogu', () => {
  it('unikalne id, adopt i giftBase dodatnie', () => {
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(SPECIES.length);
    for (const s of SPECIES) {
      expect(s.adopt).toBeGreaterThan(0);
      expect(s.giftBase).toBeGreaterThan(0);
    }
  });
});

describe('findSpecies — wyszukiwanie po id', () => {
  it('dokładne / case-insensitive / trim', () => {
    expect(findSpecies('cat')?.id).toBe('cat');
    expect(findSpecies('  DRAGON ')?.id).toBe('dragon');
  });
  it('nieznane → undefined', () => {
    expect(findSpecies('jednorozec')).toBeUndefined();
    expect(findSpecies('')).toBeUndefined();
  });
});

describe('petLevel — kap MAX_LEVEL = 50 (nieobjęty wcześniej)', () => {
  it('ogromne XP nie przebija 50', () => {
    expect(petLevel(1_000_000)).toBe(50);
    expect(petLevel(5000)).toBe(50); // floor(50)+1 = 51 → kap 50
    expect(petLevel(4900)).toBe(50); // floor(49)+1 = 50 (próg kapu)
  });
});

describe('giftValue — giftBase × poziom × współczynnik sytości', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('pełna sytość (factor 1.0) = giftBase × poziom', () => {
    expect(giftValue(pet(0, NOW), sp('hamster'))).toBe(30); // 30×1×1.0
    expect(giftValue(pet(0, NOW), sp('dragon'))).toBe(200); // 200×1×1.0
  });

  it('głód maksymalny (last_fed=null → factor 0.2)', () => {
    expect(giftValue(pet(0, null), sp('hamster'))).toBe(6); // round(30×1×0.2)
  });

  it('skaluje poziomem (xp 250 → poziom 3)', () => {
    expect(giftValue(pet(250, NOW), sp('hamster'))).toBe(90); // 30×3×1.0
  });

  it('sytość podbija wartość: pełny > głodny dla tego samego peta', () => {
    const full = giftValue(pet(250, NOW), sp('hamster'));
    const starving = giftValue(pet(250, null), sp('hamster'));
    expect(full).toBeGreaterThan(starving);
  });

  it('zawsze ≥ 1 (klamra dolna)', () => {
    for (const s of SPECIES) {
      expect(giftValue(pet(0, null), s)).toBeGreaterThanOrEqual(1);
    }
  });
});
