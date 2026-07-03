import { describe, expect, it } from 'vitest';
import { usageLevel } from './UsageMeter';

describe('usageLevel — próg licznika limitu', () => {
  it('daleko od limitu → ok', () => {
    expect(usageLevel(0, 10)).toBe('ok');
    expect(usageLevel(7, 10)).toBe('ok'); // 7 < 10-2
  });
  it('≤2 od limitu → near', () => {
    expect(usageLevel(8, 10)).toBe('near'); // 10-2
    expect(usageLevel(9, 10)).toBe('near');
  });
  it('na limicie → over', () => {
    expect(usageLevel(10, 10)).toBe('over');
  });
  it('ponad limitem (grandfathering) → over', () => {
    expect(usageLevel(15, 10)).toBe('over');
  });
  it('małe limity nie fałszują near', () => {
    expect(usageLevel(0, 3)).toBe('ok'); // 0 < 3-2 → 0 użytych z 3 to nie „blisko"
    expect(usageLevel(1, 3)).toBe('near'); // od 1/3 zaczyna nudge'ować
    expect(usageLevel(3, 3)).toBe('over');
  });
  it('limit 0/ujemny → ok (brak dzielenia/nacisku)', () => {
    expect(usageLevel(5, 0)).toBe('ok');
    expect(usageLevel(5, -1)).toBe('ok');
  });
});
