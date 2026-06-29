// Czysta logika progu celu społeczności (bez IO).
import { describe, expect, it } from 'vitest';
import { goalReached } from './goals.mts';

describe('goalReached — próg celu społeczności', () => {
  it('osiągnięty przy równości i powyżej', () => {
    expect(goalReached(100, 100)).toBe(true);
    expect(goalReached(101, 100)).toBe(true);
  });
  it('nieosiągnięty poniżej progu', () => {
    expect(goalReached(99, 100)).toBe(false);
  });
  it('target ≤ 0 = nieaktywny (nigdy nie ogłasza)', () => {
    expect(goalReached(50, 0)).toBe(false);
    expect(goalReached(50, -5)).toBe(false);
  });
});
