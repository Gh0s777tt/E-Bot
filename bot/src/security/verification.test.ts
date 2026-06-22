// Rygiel porównania hasła weryfikacji (phraseMatches) — wyłoniony behavior-preserving z handlera
// modala (tryb 'phrase'). KLUCZ BEZPIECZEŃSTWA: puste/białe hasło w configu NIGDY nie waliduje
// (inaczej brama anty-bot stoi otworem — każdy wpis przechodzi); porównanie z trim + nieczułe na
// wielkość liter PO OBU STRONACH. Regresja = obejście weryfikacji.
import { describe, expect, it } from 'vitest';
import { checkCaptcha, phraseMatches } from './verification.mts';

describe('phraseMatches — hasło weryfikacji', () => {
  it('dokładne dopasowanie → true', () => {
    expect(phraseMatches('swordfish', 'swordfish')).toBe(true);
  });

  it('nieczułość na wielkość liter (oba kierunki, też PL)', () => {
    expect(phraseMatches('SwordFish', 'swordfish')).toBe(true);
    expect(phraseMatches('hasło', 'HASŁO')).toBe(true);
  });

  it('trim po obu stronach', () => {
    expect(phraseMatches('  swordfish  ', 'swordfish')).toBe(true);
    expect(phraseMatches('x', '   x   ')).toBe(true);
  });

  it('RYGIEL bezpieczeństwa: puste/białe hasło w configu NIGDY nie waliduje', () => {
    expect(phraseMatches('', '')).toBe(false);
    expect(phraseMatches('cokolwiek', '')).toBe(false);
    expect(phraseMatches('', '   ')).toBe(false);
    expect(phraseMatches('   ', '   ')).toBe(false);
  });

  it('błędne hasło → false', () => {
    expect(phraseMatches('wrong', 'swordfish')).toBe(false);
  });
});

// Rygiel weryfikacji captchy (checkCaptcha) — anty-bot/raid. KLUCZ: kod JEDNORAZOWY i czasowy — po
// terminie (exp < now) lub bez wpisu → 'expired' (nie da się reużyć starego/wygasłego); dopasowanie
// po trim + WIELKIE litery (kod generowany uppercase). Status zamiast boola → odrębne komunikaty.
describe('checkCaptcha — weryfikacja kodu captchy', () => {
  const code = 'AB3D9';
  const fresh = (now: number) => ({ code, exp: now + 60_000 });

  it('poprawny kod w terminie → ok (z normalizacją trim + uppercase)', () => {
    expect(checkCaptcha(fresh(1000), 'AB3D9', 1000)).toBe('ok');
    expect(checkCaptcha(fresh(1000), '  ab3d9  ', 1000)).toBe('ok');
  });

  it('RYGIEL terminu: wpis po terminie (exp < now) → expired, mimo poprawnego kodu', () => {
    expect(checkCaptcha({ code, exp: 1000 }, code, 1001)).toBe('expired');
  });

  it('granica: exp === now jeszcze ważne (exp < now fałszywe)', () => {
    expect(checkCaptcha({ code, exp: 1000 }, code, 1000)).toBe('ok');
  });

  it('RYGIEL braku wpisu: undefined → expired (nie crash, nie ok)', () => {
    expect(checkCaptcha(undefined, code, 1000)).toBe('expired');
  });

  it('zły kod w terminie → wrong', () => {
    expect(checkCaptcha(fresh(1000), 'ZZZZZ', 1000)).toBe('wrong');
  });
});
