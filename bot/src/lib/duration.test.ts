import { describe, expect, it } from 'vitest';
import { formatDuration, parseDuration } from './duration.mts';

describe('parseDuration', () => {
  it('parsuje pojedyncze jednostki', () => {
    expect(parseDuration('10s')).toBe(10_000);
    expect(parseDuration('5m')).toBe(300_000);
    expect(parseDuration('2h')).toBe(7_200_000);
    expect(parseDuration('1d')).toBe(86_400_000);
  });
  it('sumuje łączone', () => {
    expect(parseDuration('1h30m')).toBe(5_400_000);
    expect(parseDuration('1d12h')).toBe(86_400_000 + 12 * 3_600_000);
  });
  it('toleruje spacje i wielkość liter', () => {
    expect(parseDuration('2 H')).toBe(7_200_000);
  });
  it('zwraca null dla śmieci / pustych', () => {
    expect(parseDuration('abc')).toBeNull();
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('0s')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('formatuje złożone', () => {
    expect(formatDuration(5_400_000)).toBe('1h 30m');
    expect(formatDuration(86_400_000)).toBe('1d');
  });
  it('krótkie → <1m', () => {
    expect(formatDuration(5_000)).toBe('<1m');
  });
});
