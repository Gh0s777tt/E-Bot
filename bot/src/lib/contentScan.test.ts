import { describe, expect, it } from 'vitest';
import { findPII, luhn, scanScam, validIban, validIdCardPL, validPesel } from './contentScan.mts';

describe('luhn (karta)', () => {
  it('akceptuje poprawną (też ze spacjami)', () => {
    expect(luhn('4242424242424242')).toBe(true);
    expect(luhn('4242 4242 4242 4242')).toBe(true);
  });
  it('odrzuca błędną / za krótką', () => {
    expect(luhn('4242424242424241')).toBe(false);
    expect(luhn('1234')).toBe(false);
  });
});

describe('validPesel', () => {
  it('poprawny', () => expect(validPesel('44051401359')).toBe(true));
  it('zła suma kontrolna', () => expect(validPesel('44051401358')).toBe(false));
  it('zły format', () => {
    expect(validPesel('123')).toBe(false);
    expect(validPesel('abcdefghijk')).toBe(false);
  });
});

describe('validIdCardPL (dowód)', () => {
  it('poprawny', () => expect(validIdCardPL('ABA300000')).toBe(true));
  it('zła cyfra kontrolna', () => expect(validIdCardPL('ABA300001')).toBe(false));
  it('zły format', () => {
    expect(validIdCardPL('AB1234567')).toBe(false);
    expect(validIdCardPL('ABCD12345')).toBe(false);
  });
});

describe('validIban', () => {
  it('poprawny PL (zwarty i ze spacjami)', () => {
    expect(validIban('PL61109010140000071219812874')).toBe(true);
    expect(validIban('PL61 1090 1014 0000 0712 1981 2874')).toBe(true);
  });
  it('błędna suma', () => expect(validIban('PL00109010140000071219812874')).toBe(false));
});

describe('scanScam', () => {
  it('podrabiany Discord', () =>
    expect(scanScam('darmowe nitro http://discord-nitro.com/claim')).toBeTruthy());
  it('oferta free nitro obok linku', () =>
    expect(scanScam('Free nitro tutaj: https://bit.ly/x')).toBeTruthy());
  it('podrabiany Steam', () =>
    expect(scanScam('odbierz skiny http://steamcommunity.ru.com/gift')).toBeTruthy());
  it('przepuszcza prawdziwy discord', () =>
    expect(scanScam('zobacz https://discord.com/channels/1/2')).toBeNull());
  it('własna lista domen', () =>
    expect(scanScam('wejdź na http://zly.example/a', ['zly.example'])).toBeTruthy());
  it('brak linku → null', () => expect(scanScam('zwykła wiadomość bez linków')).toBeNull());
  it('zwodniczy URL z @ (userinfo przed domeną)', () =>
    expect(scanScam('zaloguj się https://discord.com@evil.ru/login')).toBeTruthy());
  it('przepuszcza zwykłe userinfo bez domeny', () =>
    expect(scanScam('repo https://user@github.com/a/b')).toBeNull());
  it('domena punycode w kontekście odbioru', () =>
    expect(scanScam('odbierz darmowe nitro https://xn--80ak6aa92e.com/claim')).toBeTruthy());
  it('punycode bez kontekstu → null (precyzja)', () =>
    expect(scanScam('moja strona https://xn--80ak6aa92e.com')).toBeNull());
  it('skrócony link + wezwanie do działania', () =>
    expect(scanScam('Gratulacje, wygrałeś nagrodę! Odbierz: https://bit.ly/abc')).toBeTruthy());
  it('skrócony link bez wezwania → null (precyzja)', () =>
    expect(scanScam('mój blog https://bit.ly/myblog')).toBeNull());
});

describe('findPII', () => {
  const all = { creditCard: true, pesel: true, idCard: true, iban: true, phone: true, email: true };
  it('karta', () => expect(findPII('moja karta 4242 4242 4242 4242', all)).toContain('creditCard'));
  it('PESEL', () => expect(findPII('pesel 44051401359 ok', all)).toContain('pesel'));
  it('dowód', () => expect(findPII('dowód ABA300000', all)).toContain('idCard'));
  it('IBAN', () => expect(findPII('konto PL61109010140000071219812874', all)).toContain('iban'));
  it('e-mail', () => expect(findPII('pisz na a@b.com', all)).toContain('email'));
  it('telefon PL', () => expect(findPII('tel +48 600 700 800', all)).toContain('phone'));
  it('respektuje wyłączone typy', () => expect(findPII('a@b.com', { email: false })).toEqual([]));
  it('czysty tekst → []', () => expect(findPII('po prostu cześć wszystkim 2024', all)).toEqual([]));
});
