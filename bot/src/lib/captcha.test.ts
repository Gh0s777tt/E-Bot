// Rygiel generatora kodu captcha (generateCaptchaCode + ALPHABET) — brama weryfikacji anty-bot/raid.
// Renderowanie obrazka (renderCaptcha) pominięte: zależy od natywnego @napi-rs/canvas + fontów.
// KLUCZ: alfabet bez znaków dwuznacznych (0/O/1/I/L) — inaczej człowiek nie przepisze i obleje
// legalną weryfikację; kod uniform z crypto.randomInt (cały alfabet osiągalny, brak obcięcia indeksu).
import { describe, expect, it } from 'vitest';
import { ALPHABET, generateCaptchaCode } from './captcha.mts';

const AMBIGUOUS = ['0', 'O', '1', 'I', 'L'];

describe('ALPHABET — kontrakt czytelności', () => {
  it('RYGIEL: brak znaków dwuznacznych (0/O/1/I/L) — user musi móc przepisać kod', () => {
    for (const c of AMBIGUOUS)
      expect(ALPHABET, `alfabet nie może zawierać dwuznacznego "${c}"`).not.toContain(c);
  });

  it('znaki unikalne (równomierny rozkład losowania — żaden nie faworyzowany)', () => {
    expect(new Set(ALPHABET).size).toBe(ALPHABET.length);
  });

  it('niepusty', () => {
    expect(ALPHABET.length).toBeGreaterThan(0);
  });
});

describe('generateCaptchaCode — generator kodu weryfikacji', () => {
  it('domyślna długość = 5', () => {
    expect(generateCaptchaCode()).toHaveLength(5);
  });

  it('respektuje zadaną długość (0 → "", 1, 8)', () => {
    expect(generateCaptchaCode(0)).toBe('');
    expect(generateCaptchaCode(1)).toHaveLength(1);
    expect(generateCaptchaCode(8)).toHaveLength(8);
  });

  it('każdy wygenerowany znak ∈ ALPHABET (sweep 2000 znaków)', () => {
    for (const c of generateCaptchaCode(2000)) expect(ALPHABET).toContain(c);
  });

  it('RYGIEL pełnego zasięgu indeksu: każdy znak ALPHABET osiągalny (coupon-collector 5000)', () => {
    // Obcięcie zakresu losowania (randomInt(len-1)) uczyniłoby ostatni znak nieosiągalnym.
    const seen = new Set(generateCaptchaCode(5000));
    expect(seen.size).toBe(ALPHABET.length);
  });
});
