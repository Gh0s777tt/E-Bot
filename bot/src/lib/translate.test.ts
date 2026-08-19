// Tłumaczenie zapasowe (bez AI) — mapa języków i zachowanie przy awarii.
//
// Testy pilnują trzech rzeczy: żeby mapa kodów NIE ROZJECHAŁA SIĘ z listą flag w `flagtranslate`
// (flaga bez kodu = funkcja milczy dla tego kraju), żeby zapas nigdy nie wkleił użytkownikowi
// komunikatu błędu jako „tłumaczenia", i żeby każda awaria kończyła się `null`, a nie wyjątkiem —
// bo zapas nie może zepsuć niczego, co dotąd działało.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { kodIso, LICZBA_JEZYKOW, tlumaczZapasowo } from './translate.mts';

/** Odpowiedź MyMemory w kształcie 1:1 z produkcyjną. */
const odp = (o: Record<string, unknown>) => ({
  ok: true,
  json: async () => ({
    responseStatus: 200,
    responseData: { translatedText: 'good morning' },
    ...o,
  }),
});

describe('kodIso', () => {
  it('mapuje polskie nazwy języków na ISO 639-1', () => {
    expect(kodIso('angielski')).toBe('en');
    expect(kodIso('japoński')).toBe('ja');
    expect(kodIso('ukraiński')).toBe('uk');
  });

  it('jest odporne na wielkość liter', () => {
    expect(kodIso('Niemiecki')).toBe('de');
  });

  // `null` znaczy „nie tłumacz", a NIE „użyj angielskiego": tłumaczenie na zły język wygląda
  // na działającą funkcję i jest gorsze niż jej brak.
  it('nieznany język daje null, a nie domyślny', () => {
    expect(kodIso('klingoński')).toBeNull();
    expect(kodIso('')).toBeNull();
  });

  // Flaga, dla której `COUNTRY_LANG` zna język, ale mapa kodów nie — to cicha dziura: reakcja
  // nic nie zrobi i nikt się nie dowie dlaczego.
  it('zna KAŻDY język wymieniony w COUNTRY_LANG w flagtranslate', () => {
    const plik = resolve(dirname(fileURLToPath(import.meta.url)), '../community/flagtranslate.mts');
    const src = readFileSync(plik, 'utf8');
    const blok = src.slice(
      src.indexOf('const COUNTRY_LANG'),
      src.indexOf('};', src.indexOf('const COUNTRY_LANG')),
    );
    const jezyki = [...new Set([...blok.matchAll(/:\s*'([^']+)'/g)].map((m) => m[1]))];
    expect(jezyki.length).toBeGreaterThan(20); // parser faktycznie coś znalazł
    const bezKodu = jezyki.filter((j) => kodIso(j) === null);
    expect(bezKodu, `flagi bez kodu ISO — reakcja będzie milczeć: ${bezKodu.join(', ')}`).toEqual(
      [],
    );
  });

  it('mapa nie skurczyła się przypadkiem', () => {
    expect(LICZBA_JEZYKOW).toBeGreaterThanOrEqual(25);
  });
});

describe('tlumaczZapasowo', () => {
  it('zwraca tłumaczenie z poprawnej odpowiedzi', async () => {
    const f = vi.fn().mockResolvedValue(odp({}));
    expect(await tlumaczZapasowo('dzień dobry', 'en', 'pl', f as unknown as typeof fetch)).toBe(
      'good morning',
    );
  });

  it('wysyła język źródłowy i docelowy w parametrze langpair', async () => {
    const f = vi.fn().mockResolvedValue(odp({}));
    await tlumaczZapasowo('test', 'ja', 'pl', f as unknown as typeof fetch);
    expect(String(f.mock.calls[0][0])).toContain('langpair=pl|ja');
  });

  // Przy wyczerpanym limicie MyMemory oddaje TEKST BŁĘDU w miejscu tłumaczenia. Wklejenie go
  // użytkownikowi jako „tłumaczenia" byłoby gorsze niż milczenie.
  it('odrzuca odpowiedź ze statusem innym niż 200 w ciele', async () => {
    const f = vi
      .fn()
      .mockResolvedValue(
        odp({ responseStatus: 429, responseData: { translatedText: 'QUOTA EXCEEDED' } }),
      );
    expect(await tlumaczZapasowo('x', 'en', 'auto', f as unknown as typeof fetch)).toBeNull();
  });

  it('odrzuca echo wejścia — to nie jest tłumaczenie', async () => {
    const f = vi.fn().mockResolvedValue(odp({ responseData: { translatedText: 'Dzień Dobry' } }));
    expect(
      await tlumaczZapasowo('dzień dobry', 'en', 'pl', f as unknown as typeof fetch),
    ).toBeNull();
  });

  it('odrzuca pustą i nietekstową odpowiedź', async () => {
    for (const zle of [{ translatedText: '   ' }, { translatedText: 42 }, null]) {
      const f = vi.fn().mockResolvedValue(odp({ responseData: zle }));
      expect(await tlumaczZapasowo('x', 'en', 'auto', f as unknown as typeof fetch)).toBeNull();
    }
  });

  it('błąd HTTP i wyjątek sieci dają null, nie rzucają', async () => {
    const zly = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    expect(await tlumaczZapasowo('x', 'en', 'auto', zly as unknown as typeof fetch)).toBeNull();
    const padl = vi.fn().mockRejectedValue(new Error('ETIMEDOUT'));
    expect(await tlumaczZapasowo('x', 'en', 'auto', padl as unknown as typeof fetch)).toBeNull();
  });

  it('nie wychodzi w sieć dla pustego tekstu ani złego kodu języka', async () => {
    const f = vi.fn();
    expect(await tlumaczZapasowo('   ', 'en', 'auto', f as unknown as typeof fetch)).toBeNull();
    expect(await tlumaczZapasowo('x', 'ENG', 'auto', f as unknown as typeof fetch)).toBeNull();
    expect(await tlumaczZapasowo('x', '', 'auto', f as unknown as typeof fetch)).toBeNull();
    expect(f).not.toHaveBeenCalled();
  });

  it('przycina długi tekst zamiast wysyłać całość', async () => {
    const f = vi.fn().mockResolvedValue(odp({}));
    await tlumaczZapasowo('a'.repeat(5000), 'en', 'auto', f as unknown as typeof fetch);
    const wyslane = decodeURIComponent(String(f.mock.calls[0][0]).split('q=')[1].split('&')[0]);
    expect(wyslane.length).toBeLessThanOrEqual(500);
  });
});
