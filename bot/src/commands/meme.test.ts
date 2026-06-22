// Rygiel escapingu memegen (/meme → esc) — koduje tekst do ścieżki URL memegen.link.
// KLUCZ: kolejność operacji — `_` i `-` podwajane PRZED zamianą spacji na `_`, inaczej oryginalny `_`
// i spacja-jako-`_` stają się nierozróżnialne (zepsuty mem). Pusty/blank → `_` (memegen wymaga
// placeholdera dla pustego panelu). Znaki specjalne mapowane na sekwencje `~x`, by nie zepsuć URL.
import { describe, expect, it } from 'vitest';
import { esc } from './meme.mts';

describe('esc — kodowanie tekstu memegen', () => {
  it('pusty / blank / null → "_" (placeholder pustego panelu)', () => {
    expect(esc(null)).toBe('_');
    expect(esc('')).toBe('_');
    expect(esc('   ')).toBe('_');
  });

  it('zwykły tekst bez znaków specjalnych — bez zmian (po trim)', () => {
    expect(esc('hello')).toBe('hello');
    expect(esc('  hi  ')).toBe('hi'); // trim
  });

  it('spacja → _, podwojenie _ i -', () => {
    expect(esc('a b')).toBe('a_b');
    expect(esc('a_b')).toBe('a__b');
    expect(esc('a-b')).toBe('a--b');
  });

  it('RYGIEL kolejności: "a_b c" → "a__b_c" (podwojenie _ PRZED spacją→_)', () => {
    // gdyby spacja→_ szła pierwsza: 'a_b_c' → potem _→__ dałoby 'a__b__c' (oryginalna spacja zepsuta)
    expect(esc('a_b c')).toBe('a__b_c');
  });

  it('znaki specjalne → sekwencje ~x (anty-rozbicie URL)', () => {
    expect(esc('?')).toBe('~q');
    expect(esc('&')).toBe('~a');
    expect(esc('%')).toBe('~p');
    expect(esc('#')).toBe('~h');
    expect(esc('/')).toBe('~s');
    expect(esc('\\')).toBe('~b');
    expect(esc('<')).toBe('~l');
    expect(esc('>')).toBe('~g');
    expect(esc('"')).toBe("''");
    expect(esc('a\nb')).toBe('a~nb');
  });
});
