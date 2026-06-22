// Rygiel parsera deali ITAD (parseItad) — niezaufany JSON z API IsThereAnyDeal (multi-store darmówki).
// KLUCZ: garbage → []; tylko REALNIE darmowe (cut ≥ 100% LUB cena 0) — inaczej bot ogłasza przecenę
// jako rozdanie; oraz strażnik braku stabilnego id (`itad:` puste → pominięte, inaczej re-post bez końca,
// bo dedup nie miałby klucza). Fallbacki: title→„Gra", url→null, shop→„sklepie".
import { describe, expect, it } from 'vitest';
import { parseItad } from './freegames.mts';

const deal = (over: Record<string, unknown> = {}) => ({
  cut: 100,
  price: { amount: 0 },
  shop: { name: 'GOG' },
  url: 'https://gog/x',
  ...over,
});
const item = (over: Record<string, unknown> = {}) => ({
  id: 'd1',
  title: 'Free Deal',
  deal: deal(),
  ...over,
});
const resp = (list: unknown[]) => ({ list });

describe('parseItad — parser deali ITAD (fail-safe)', () => {
  it('garbage / brak list-tablicy → []', () => {
    for (const bad of [null, undefined, 'x', 42, {}, { list: 'nie-tablica' }, resp([])])
      expect(parseItad(bad)).toEqual([]);
  });

  it('darmowe przez cut ≥ 100 → wyciągnięte', () => {
    const [d] = parseItad(resp([item({ deal: deal({ cut: 100, price: { amount: 9.99 } }) })]));
    expect(d).toEqual({ id: 'itad:d1', title: 'Free Deal', url: 'https://gog/x', shop: 'GOG' });
  });

  it('darmowe przez cenę 0 (mimo cut < 100) → wyciągnięte', () => {
    expect(parseItad(resp([item({ deal: deal({ cut: 0, price: { amount: 0 } }) })]))).toHaveLength(
      1,
    );
  });

  it('RYGIEL: NIE-darmowe (cut < 100 i cena > 0) → pominięte', () => {
    expect(parseItad(resp([item({ deal: deal({ cut: 50, price: { amount: 9.99 } }) })]))).toEqual(
      [],
    );
  });

  it('brak deal → pominięte', () => {
    expect(parseItad(resp([item({ deal: undefined })]))).toEqual([]);
  });

  it('RYGIEL braku id: darmowe bez id/slug/url/title → pominięte (brak klucza dedup = re-post)', () => {
    const noKey = { deal: deal({ cut: 100, url: undefined }) }; // brak id/slug/url/title
    expect(parseItad(resp([noKey]))).toEqual([]);
  });

  it('fallbacki: title→„Gra", url→null (brak deal.url), shop→„sklepie"', () => {
    const [d] = parseItad(resp([{ id: 'd2', deal: { cut: 100, shop: {}, price: { amount: 0 } } }]));
    expect(d).toMatchObject({ id: 'itad:d2', title: 'Gra', url: null, shop: 'sklepie' });
  });
});
