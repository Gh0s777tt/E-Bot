// Test krzywej XP→poziom (levelForXp) — czysta matematyka levelingu. Do awansu z L na L+1 trzeba
// 5L²+50L+100 XP (progi kumulacyjne). Regresja formuły = cicha zmiana rankingu wszystkich użytkowników.
import { describe, expect, it } from 'vitest';
import { levelForXp } from './leveling.mts';

describe('levelForXp — krzywa XP→poziom (próg 5L²+50L+100 na poziom)', () => {
  it('0 XP = poziom 0; tuż pod progiem L1 (100) wciąż 0', () => {
    expect(levelForXp(0)).toBe(0);
    expect(levelForXp(99)).toBe(0);
  });

  it('progi kumulacyjne: 100→L1, 255→L2, 475→L3 (i wartości tuż pod progiem)', () => {
    expect(levelForXp(100)).toBe(1); // próg L1
    expect(levelForXp(254)).toBe(1);
    expect(levelForXp(255)).toBe(2); // 100 + 155
    expect(levelForXp(474)).toBe(2);
    expect(levelForXp(475)).toBe(3); // 255 + 220
  });

  it('monotoniczna — więcej XP nigdy nie obniża poziomu', () => {
    let prev = 0;
    for (let xp = 0; xp <= 20_000; xp += 137) {
      const lvl = levelForXp(xp);
      expect(lvl).toBeGreaterThanOrEqual(prev);
      prev = lvl;
    }
  });

  it('ujemne XP nie wybucha → 0', () => {
    expect(levelForXp(-50)).toBe(0);
  });
});
