// Rygiel taga tygodnia UTC (weekKey) — wspólne źródło prawdy dla dedup digestu + resetu questów weekly.
// Regresja = digest wysłany dwa razy / quest weekly zresetowany w złym tygodniu. Wzór: rok UTC +
// `W${floor(dzień_roku / 7)}`, gdzie dzień_roku liczony od 1 stycznia UTC (dzielnik dnia = 86_400_000).
import { describe, expect, it } from 'vitest';
import { weekKey } from './weekKey.mts';

describe('weekKey — tag tygodnia YYYY-Wnn (UTC)', () => {
  it('1 stycznia → W0; granica 7. dnia → W1', () => {
    expect(weekKey(new Date('2026-01-01T00:00:00Z'))).toBe('2026-W0');
    expect(weekKey(new Date('2026-01-07T12:00:00Z'))).toBe('2026-W0'); // doy 6 → W0
    expect(weekKey(new Date('2026-01-08T00:00:00Z'))).toBe('2026-W1'); // doy 7 → W1
  });

  it('koniec roku → W52, rok z UTC', () => {
    expect(weekKey(new Date('2026-12-31T00:00:00Z'))).toBe('2026-W52');
  });

  it('granica roku → reset do W0 nowego roku', () => {
    expect(weekKey(new Date('2027-01-01T00:00:00Z'))).toBe('2027-W0');
  });

  it('liczone w UTC (nie w lokalnej strefie) — ten sam moment → ten sam tag', () => {
    const t = new Date('2026-06-15T10:00:00Z');
    expect(weekKey(t)).toBe(weekKey(new Date(t.getTime())));
    // 2026-06-15: doy = 165 (sty31+lut28+mar31+kwi30+maj31+14) → floor(165/7)=23
    expect(weekKey(t)).toBe('2026-W23');
  });
});
