// Rygiel porównania hasła weryfikacji (phraseMatches) — wyłoniony behavior-preserving z handlera
// modala (tryb 'phrase'). KLUCZ BEZPIECZEŃSTWA: puste/białe hasło w configu NIGDY nie waliduje
// (inaczej brama anty-bot stoi otworem — każdy wpis przechodzi); porównanie z trim + nieczułe na
// wielkość liter PO OBU STRONACH. Regresja = obejście weryfikacji.
import { describe, expect, it } from 'vitest';
import { phraseMatches } from './verification.mts';

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
