import { describe, expect, it } from 'vitest';
import { isQuietHour } from './lockschedule.mts';

describe('isQuietHour', () => {
  it('okno w obrębie doby (lock 1 → unlock 7)', () => {
    expect(isQuietHour(0, 1, 7)).toBe(false);
    expect(isQuietHour(1, 1, 7)).toBe(true);
    expect(isQuietHour(6, 1, 7)).toBe(true);
    expect(isQuietHour(7, 1, 7)).toBe(false);
    expect(isQuietHour(23, 1, 7)).toBe(false);
  });

  it('okno przez północ (lock 23 → unlock 7)', () => {
    expect(isQuietHour(22, 23, 7)).toBe(false);
    expect(isQuietHour(23, 23, 7)).toBe(true);
    expect(isQuietHour(0, 23, 7)).toBe(true);
    expect(isQuietHour(6, 23, 7)).toBe(true);
    expect(isQuietHour(7, 23, 7)).toBe(false);
  });

  it('lock === unlock → brak okna', () => {
    expect(isQuietHour(5, 5, 5)).toBe(false);
    expect(isQuietHour(0, 5, 5)).toBe(false);
  });

  it('okno od północy (lock 0 → unlock 12)', () => {
    expect(isQuietHour(0, 0, 12)).toBe(true);
    expect(isQuietHour(11, 0, 12)).toBe(true);
    expect(isQuietHour(12, 0, 12)).toBe(false);
  });
});
