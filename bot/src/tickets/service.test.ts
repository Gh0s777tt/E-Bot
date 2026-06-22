// Rygiel escapingu HTML transkryptu ticketów (esc) — treść użytkownika trafia do HTML transkryptu,
// więc MUSI być escapowana (anty-XSS). KLUCZ: `&` escapowane PIERWSZE — inaczej `<`→`&lt;`, a potem
// `&`→`&amp;` zrobiłoby z tego `&amp;lt;` (podwójny escape, zepsuty transkrypt). Wszystkie wystąpienia.
import { describe, expect, it } from 'vitest';
import { esc } from './service.mts';

describe('esc — escaping HTML transkryptu (anty-XSS)', () => {
  it('pusty / bez znaków specjalnych → bez zmian', () => {
    expect(esc('')).toBe('');
    expect(esc('zwykły tekst 123')).toBe('zwykły tekst 123');
  });

  it('podstawowe encje: & < >', () => {
    expect(esc('a & b')).toBe('a &amp; b');
    expect(esc('a < b')).toBe('a &lt; b');
    expect(esc('a > b')).toBe('a &gt; b');
  });

  it('RYGIEL kolejności: `&` escapowane PIERWSZE (brak podwójnego escape)', () => {
    // gdyby `<` szło przed `&`: '<' → '&lt;' → '&amp;lt;' (zepsute)
    expect(esc('<script>')).toBe('&lt;script&gt;');
    expect(esc('a & <b>')).toBe('a &amp; &lt;b&gt;');
  });

  it('RYGIEL anty-XSS: payload bez surowych < > i nieescapowanego &', () => {
    const out = esc('<img src=x onerror="alert(1)&amp">');
    expect(out).not.toMatch(/[<>]/);
    expect(out).toContain('&lt;img');
    expect(out).toContain('&gt;');
  });

  it('wszystkie wystąpienia (globalnie), nie tylko pierwsze', () => {
    expect(esc('<<>>')).toBe('&lt;&lt;&gt;&gt;');
    expect(esc('&&&')).toBe('&amp;&amp;&amp;');
  });
});
