import { describe, expect, it } from 'vitest';
import { isValidOAuthState, safeNextDest } from './auth';

describe('isValidOAuthState — CSRF w OAuth', () => {
  it('zgodny code+state+cookie → true', () => {
    expect(isValidOAuthState('abc', 'xyz', 'xyz')).toBe(true);
  });

  it('odrzuca brak code / brak state / brak cookie / niezgodność (CSRF)', () => {
    expect(isValidOAuthState(null, 'xyz', 'xyz')).toBe(false);
    expect(isValidOAuthState('abc', null, 'xyz')).toBe(false);
    expect(isValidOAuthState('abc', 'xyz', undefined)).toBe(false);
    expect(isValidOAuthState('abc', 'xyz', 'INNY')).toBe(false);
    expect(isValidOAuthState('abc', '', '')).toBe(false); // puste ≠ ważne
  });
});

describe('safeNextDest — anty-open-redirect po logowaniu', () => {
  it('dopuszcza ścieżki wewnętrzne', () => {
    expect(safeNextDest('/p/appeal?g=123')).toBe('/p/appeal?g=123');
    expect(safeNextDest('/settings')).toBe('/settings');
    expect(safeNextDest('/')).toBe('/');
  });

  it('ODRZUCA próby wyjścia na obcy host → "/"', () => {
    expect(safeNextDest('//evil.com')).toBe('/'); // protocol-relative
    expect(safeNextDest('/\\evil.com')).toBe('/'); // backslash-trick (część przeglądarek = //)
    expect(safeNextDest('https://evil.com')).toBe('/'); // absolutny URL
    expect(safeNextDest('javascript:alert(1)')).toBe('/');
    expect(safeNextDest('evil.com')).toBe('/'); // bez wiodącego /
    expect(safeNextDest(undefined)).toBe('/');
    expect(safeNextDest('')).toBe('/');
  });

  it('ucina bardzo długie ścieżki do 300 znaków', () => {
    const long = `/${'a'.repeat(500)}`;
    expect(safeNextDest(long).length).toBe(300);
  });
});
