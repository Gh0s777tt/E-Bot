// Test progów odznak-tierów (tierAtLevel/nextTier) — czyste funkcje. tierAtLevel ma semantykę DOKŁADNEGO
// progu (odznaka ogłaszana tylko gdy poziom == próg); regresja na `>=` = spam odznaki co poziom powyżej.
import { describe, expect, it } from 'vitest';
import { nextTier, tierAtLevel } from './achievements.mts';

describe('tierAtLevel — odznaka dokładnie na progu (ogłoszenie przy awansie)', () => {
  it('zwraca tier TYLKO gdy poziom == próg', () => {
    expect(tierAtLevel(5)?.key).toBe('novice');
    expect(tierAtLevel(10)?.key).toBe('bronze');
    expect(tierAtLevel(25)?.key).toBe('silver');
    expect(tierAtLevel(200)?.key).toBe('legend');
  });

  it('pomiędzy progami / powyżej / poniżej → brak odznaki (inaczej spam co poziom)', () => {
    expect(tierAtLevel(4)).toBeUndefined();
    expect(tierAtLevel(6)).toBeUndefined();
    expect(tierAtLevel(201)).toBeUndefined();
    expect(tierAtLevel(0)).toBeUndefined();
  });
});

describe('nextTier — następny tier ŚCIŚLE powyżej poziomu', () => {
  it('zwraca pierwszy próg > poziom', () => {
    expect(nextTier(0)?.key).toBe('novice'); // próg 5
    expect(nextTier(5)?.key).toBe('bronze'); // ściśle powyżej 5 → 10
    expect(nextTier(10)?.key).toBe('silver'); // 25
    expect(nextTier(99)?.key).toBe('diamond'); // 100
  });

  it('powyżej najwyższego progu → undefined (wszystkie zdobyte)', () => {
    expect(nextTier(200)).toBeUndefined();
    expect(nextTier(999)).toBeUndefined();
  });
});
