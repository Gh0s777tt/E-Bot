import { describe, expect, it } from 'vitest';
import { computeSlowmode } from './autoslow.mts';

describe('computeSlowmode', () => {
  it('zwraca 0 poniżej progu', () => {
    expect(computeSlowmode(0, 8, 40)).toBe(0);
    expect(computeSlowmode(7, 8, 40)).toBe(0);
  });

  it('skacze co krotność progu: 25/50/75/100% maxSlow', () => {
    expect(computeSlowmode(8, 8, 40)).toBe(10); // 1× → 25%
    expect(computeSlowmode(15, 8, 40)).toBe(10); // wciąż <2×
    expect(computeSlowmode(16, 8, 40)).toBe(20); // 2× → 50%
    expect(computeSlowmode(24, 8, 40)).toBe(30); // 3× → 75%
    expect(computeSlowmode(32, 8, 40)).toBe(40); // 4× → 100%
  });

  it('nie przekracza maxSlow nawet przy ekstremalnym tempie', () => {
    expect(computeSlowmode(1000, 8, 40)).toBe(40);
    expect(computeSlowmode(1000, 5, 30)).toBe(30);
  });

  it('degeneracje progu/limitu dają 0', () => {
    expect(computeSlowmode(50, 0, 40)).toBe(0);
    expect(computeSlowmode(50, -3, 40)).toBe(0);
    expect(computeSlowmode(50, 8, 0)).toBe(0);
  });
});
