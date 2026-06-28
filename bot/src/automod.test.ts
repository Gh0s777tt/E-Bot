// Rygiel heurystyk automoda (normalizeText · capsViolation · linkNotAllowed) — czyste funkcje
// na każdej wiadomości. Regresja = spam/obejścia przechodzą ALBO legalne wiadomości fałszywie karane.
// normalizeText to anty-bypass zakazanych słów (leet/diakrytyki/zero-width); capsViolation = próg
// wielkich liter; linkNotAllowed = whitelist domen. Czyste → 0 zmian zachowania (3× export).
import { describe, expect, it } from 'vitest';
import { capsViolation, isUnsafeRegexPattern, linkNotAllowed, normalizeText } from './automod.mts';

const caps = (percent: number, minLength: number) =>
  ({ enabled: true, percent, minLength }) as Parameters<typeof capsViolation>[1];
const cfg = (allowedLinks: string[]) =>
  ({ allowedLinks }) as unknown as Parameters<typeof linkNotAllowed>[1];

describe('isUnsafeRegexPattern — ReDoS-guard bannedRegex', () => {
  it('odrzuca kwantyfikator w grupie + na grupie (klasyczna katastrofa)', () => {
    expect(isUnsafeRegexPattern('(a+)+')).toBe(true);
    expect(isUnsafeRegexPattern('(.*)*')).toBe(true);
    expect(isUnsafeRegexPattern('([a-z]+)*')).toBe(true);
  });
  it('odrzuca alternatywę w grupie kwantyfikowanej', () => {
    expect(isUnsafeRegexPattern('(a|aa)+')).toBe(true);
    expect(isUnsafeRegexPattern('(a|b)*')).toBe(true);
  });
  it('odrzuca {n,} w grupie kwantyfikowanej', () => {
    expect(isUnsafeRegexPattern('(a{2,})+')).toBe(true);
  });
  it('odrzuca absurdalnie długie wzorce i nie-stringi', () => {
    expect(isUnsafeRegexPattern('a'.repeat(201))).toBe(true);
    expect(isUnsafeRegexPattern(null)).toBe(true);
    expect(isUnsafeRegexPattern(123)).toBe(true);
  });
  it('przepuszcza bezpieczne wzorce (listy słów, grupy bez kwantyfikatora)', () => {
    expect(isUnsafeRegexPattern('spam')).toBe(false);
    expect(isUnsafeRegexPattern('spam|hejt|ban')).toBe(false);
    expect(isUnsafeRegexPattern('(spam|hejt)')).toBe(false);
    expect(isUnsafeRegexPattern('\\bword\\b')).toBe(false);
  });
});

describe('normalizeText — anty-bypass zakazanych słów', () => {
  it('lowercase + leet (3→e, 5→s, 0→o, @→o, 1→i, 4→a)', () => {
    expect(normalizeText('H3JT')).toBe('hejt');
    expect(normalizeText('5p4m')).toBe('spam');
    expect(normalizeText('b@n')).toBe('bon');
  });

  it('zdejmuje diakrytyki (NFKD) i znaki zero-width/bidi (Cf)', () => {
    expect(normalizeText('héjt')).toBe('hejt');
    expect(normalizeText('h​ejt')).toBe('hejt'); // zero-width space
  });

  it('kolaps powtórzeń 3+ → 2', () => {
    expect(normalizeText('heeello')).toBe('heello');
    expect(normalizeText('aaaa')).toBe('aa');
  });

  it('RYGIEL równoważności obejść: leet/diakrytyk/zero-width → ta sama forma co czyste słowo', () => {
    const target = normalizeText('hejt');
    for (const variant of ['H3jt', 'héjt', 'h​ejt', 'HEJT'])
      expect(normalizeText(variant)).toBe(target);
  });
});

describe('capsViolation — próg wielkich liter', () => {
  it('poniżej minLength liter → false (ignoruje krótkie)', () => {
    expect(capsViolation('ABCDE', caps(70, 10))).toBe(false); // 5 liter < 10
  });

  it('RYGIEL progu (≥): dokładnie na progu = naruszenie', () => {
    expect(capsViolation('AAAAAAAbbb', caps(70, 10))).toBe(true); // 7/10 = 0.70 ≥ 0.70
    expect(capsViolation('AAAAAAbbbb', caps(70, 10))).toBe(false); // 6/10 = 0.60 < 0.70
  });

  it('liczy tylko litery (ignoruje symbole/spacje przy minLength i udziale)', () => {
    expect(capsViolation('A!!! ???', caps(70, 4))).toBe(false); // 1 litera < 4
    expect(capsViolation('HELLO!!! WORLD???', caps(70, 10))).toBe(true); // 10 liter, wszystkie wielkie
  });
});

describe('linkNotAllowed — whitelist domen', () => {
  it('pusta whitelist → wszystko zablokowane (true)', () => {
    expect(linkNotAllowed('https://youtube.com/x', cfg([]))).toBe(true);
  });

  it('link spoza whitelisty → true; tylko dozwolone → false', () => {
    expect(linkNotAllowed('zobacz https://youtube.com/x', cfg(['youtube.com']))).toBe(false);
    expect(linkNotAllowed('zobacz https://evil.test/x', cfg(['youtube.com']))).toBe(true);
  });

  it('RYGIEL: jeśli CHOĆ JEDEN link spoza whitelisty → true (nie da się przemycić)', () => {
    expect(linkNotAllowed('https://youtube.com/a https://evil.test/b', cfg(['youtube.com']))).toBe(
      true,
    );
  });

  it('dopasowanie domen case-insensitive', () => {
    expect(linkNotAllowed('HTTPS://YOUTUBE.COM/X', cfg(['YouTube.com']))).toBe(false);
  });
});
