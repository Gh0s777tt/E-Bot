// Rygiel runtime'u i18n — funkcja t() (interpolacja {placeholder} + łańcuch fallback locale→en→pl→klucz).
// To najgorętsza ścieżka i18n: KAŻDY zlokalizowany string przechodzi przez t(). Regresja = surowe
// klucze w UI, niepodstawione {placeholdery} albo wyjątek przy wywołaniu bez vars.
// Interpolację testujemy na NIEISTNIEJĄCYM kluczu: brak w słowniku ⇒ raw = sam klucz ⇒ interpolacja
// działa na nim wprost. Dzięki temu test jest deterministyczny i niezależny od treści słowników.
import { describe, expect, it } from 'vitest';
import { t } from './index.mts';

describe('t — interpolacja {placeholder}', () => {
  it('podstawia zmienne w treści', () => {
    expect(t('en', 'Hej {name}!', { name: 'Świat' })).toBe('Hej Świat!');
  });

  it('podstawia WSZYSTKIE wystąpienia tej samej zmiennej (flaga /g)', () => {
    expect(t('en', '{x} i jeszcze {x}', { x: 'A' })).toBe('A i jeszcze A');
  });

  it('nieznana zmienna zostaje dosłownie (nie gubimy {placeholdera})', () => {
    expect(t('en', '{a} {b}', { a: 'X' })).toBe('X {b}');
  });

  it('liczby koercjonowane do stringa', () => {
    expect(t('en', 'poziom {lvl}', { lvl: 7 })).toBe('poziom 7');
    expect(t('en', 'saldo {n}', { n: 0 })).toBe('saldo 0'); // 0 podstawione, nie pominięte
  });

  it('bez vars → treść zwracana surowo (brak przebiegu interpolacji, brak wyjątku)', () => {
    expect(t('en', 'surowe {x} tekst')).toBe('surowe {x} tekst');
  });

  it('tylko {\\w+} jest interpolowane — {a.b}/{a-b} pozostają dosłowne', () => {
    expect(t('en', '{a.b} {a-b}', { 'a.b': 'NIE', 'a-b': 'NIE' })).toBe('{a.b} {a-b}');
  });
});

describe('t — łańcuch fallback (locale → en → pl → sam klucz)', () => {
  it('istniejący klucz zwraca tłumaczenie (≠ klucz, niepuste)', () => {
    const v = t('en', 'error.generic');
    expect(v).not.toBe('error.generic');
    expect(v.length).toBeGreaterThan(0);
  });

  it('nieistniejący klucz → ostateczny fallback = sam klucz (nigdy undefined)', () => {
    expect(t('en', 'zzz.klucz.nie.istnieje.123')).toBe('zzz.klucz.nie.istnieje.123');
    expect(t('ar', 'zzz.klucz.nie.istnieje.123')).toBe('zzz.klucz.nie.istnieje.123');
  });

  it('nieobsługiwane locale spada do fallbacku, nie wybucha', () => {
    // locale spoza słownika → DICTS[locale] undefined → łańcuch ?? → en/pl/klucz.
    expect(t('xx' as never, 'error.generic')).toBe(t('en', 'error.generic'));
  });
});
