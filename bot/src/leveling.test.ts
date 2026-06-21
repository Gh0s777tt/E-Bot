// Test krzywej XP→poziom (levelForXp + levelInfo) — czysta matematyka levelingu. Do awansu z L na L+1
// trzeba 5L²+50L+100 XP (progi kumulacyjne). Regresja formuły = cicha zmiana rankingu wszystkich
// użytkowników. `levelInfo` to JEDYNE źródło prawdy dla rozbicia poziomu — /rank, /profile i giveaway
// importują je zamiast lokalnych kopii (anty-rozjazd: wcześniej 5 niezależnych implementacji formuły).
import { describe, expect, it } from 'vitest';
import { levelForXp, levelInfo } from './leveling.mts';

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

describe('levelInfo — rozbicie poziomu (level + xpInto + xpFor), wspólne źródło /rank · /profile · giveaway', () => {
  it('poziom zgodny z levelForXp (oba liczą tę samą krzywą)', () => {
    for (const xp of [0, 99, 100, 254, 255, 475, 5000, 12345]) {
      expect(levelInfo(xp).level).toBe(levelForXp(xp));
    }
  });

  it('xpFor = próg bieżącego poziomu (5L²+50L+100): L0→100, L1→155, L2→220', () => {
    expect(levelInfo(0).xpFor).toBe(100); // L0: 100
    expect(levelInfo(100).xpFor).toBe(155); // L1: 5+50+100
    expect(levelInfo(255).xpFor).toBe(220); // L2: 20+100+100
  });

  it('xpInto = XP zgromadzone w bieżącym poziomie (totalXp − próg kumulacyjny)', () => {
    expect(levelInfo(0)).toEqual({ level: 0, xpInto: 0, xpFor: 100 });
    expect(levelInfo(50)).toEqual({ level: 0, xpInto: 50, xpFor: 100 });
    expect(levelInfo(100)).toEqual({ level: 1, xpInto: 0, xpFor: 155 }); // dokładnie na progu L1
    expect(levelInfo(200)).toEqual({ level: 1, xpInto: 100, xpFor: 155 }); // 200 − 100
    expect(levelInfo(255)).toEqual({ level: 2, xpInto: 0, xpFor: 220 }); // próg L2 = 100+155
  });

  it('niezmiennik: 0 ≤ xpInto < xpFor dla całego sweepu XP', () => {
    for (let xp = 0; xp <= 20_000; xp += 91) {
      const { xpInto, xpFor } = levelInfo(xp);
      expect(xpInto).toBeGreaterThanOrEqual(0);
      expect(xpInto).toBeLessThan(xpFor);
    }
  });
});
