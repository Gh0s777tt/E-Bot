// Rygiel walidacji daty urodzin (isValidBirthday) — wyłoniony behavior-preserving z `execute`.
// KLUCZ: dzień musi mieścić się w liczbie dni MIESIĄCA (30 lutego / 31 kwietnia odrzucone), luty
// dopuszcza 29 (urodziny bez roku → nie patrzymy na rok przestępny), miesiąc 1–12, dzień ≥ 1.
// Regresja = przyjęcie nieistniejącej daty → poller urodzinowy nigdy jej nie ogłosi.
import { describe, expect, it } from 'vitest';
import { isValidBirthday } from './birthday.mts';

describe('isValidBirthday — walidacja daty urodzin (bez roku)', () => {
  it('przyjmuje istniejące daty', () => {
    expect(isValidBirthday(15, 6)).toBe(true);
    expect(isValidBirthday(1, 1)).toBe(true);
    expect(isValidBirthday(31, 1)).toBe(true); // styczeń ma 31 dni — granica
    expect(isValidBirthday(31, 12)).toBe(true);
  });

  it('RYGIEL luty bez roku: 29 OK, 30 odrzucone', () => {
    expect(isValidBirthday(29, 2)).toBe(true);
    expect(isValidBirthday(30, 2)).toBe(false);
  });

  it('RYGIEL miesięcy 30-dniowych: 31 odrzucone (kwiecień/czerwiec/wrzesień/listopad)', () => {
    for (const m of [4, 6, 9, 11]) {
      expect(isValidBirthday(31, m)).toBe(false);
      expect(isValidBirthday(30, m)).toBe(true); // granica — 30 OK
    }
  });

  it('miesiąc spoza 1–12 → false', () => {
    expect(isValidBirthday(1, 0)).toBe(false);
    expect(isValidBirthday(1, 13)).toBe(false);
  });

  it('dzień < 1 → false', () => {
    expect(isValidBirthday(0, 5)).toBe(false);
  });
});
