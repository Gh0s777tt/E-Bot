// Rygiel parsera darmówek Epic (parseFree) — wejście to NIEZAUFANY JSON z API Epic Games Store.
// KLUCZ: garbage/null → [] (poller nie wybucha); tylko gry REALNIE darmowe (discountPrice === 0 ORAZ
// aktywna promocja) trafiają na kanał — inaczej bot ogłasza płatną grę jako „za darmo". Fallbacki:
// slug (pageSlug→productSlug→urlSlug), obrazek (OfferImageWide→pierwszy→''), title/id z domyślnymi.
import { describe, expect, it } from 'vitest';
import { parseFree } from './freegames.mts';

const OFFER = {
  promotions: { promotionalOffers: [{ promotionalOffers: [{ endDate: '2026-07-01' }] }] },
};
const elem = (over: Record<string, unknown> = {}) => ({
  id: 'g1',
  title: 'Darmowa Gra',
  price: { totalPrice: { discountPrice: 0 } },
  ...OFFER,
  catalogNs: { mappings: [{ pageSlug: 'free-game' }] },
  keyImages: [{ type: 'OfferImageWide', url: 'https://img/wide.jpg' }],
  ...over,
});
const resp = (elements: unknown[]) => ({ data: { Catalog: { searchStore: { elements } } } });

describe('parseFree — parser darmówek Epic (fail-safe)', () => {
  it('garbage / null / pusty kształt → [] (poller nie wybucha)', () => {
    for (const bad of [null, undefined, 'x', 42, {}, { data: {} }, resp([])])
      expect(parseFree(bad)).toEqual([]);
  });

  it('gra realnie darmowa → wyciągnięta z poprawnymi polami', () => {
    const [g] = parseFree(resp([elem()]));
    expect(g).toEqual({
      id: 'g1',
      title: 'Darmowa Gra',
      url: 'https://store.epicgames.com/p/free-game',
      image: 'https://img/wide.jpg',
      end: '2026-07-01',
    });
  });

  it('RYGIEL: gra NIE-darmowa (discountPrice ≠ 0) → pominięta', () => {
    expect(parseFree(resp([elem({ price: { totalPrice: { discountPrice: 999 } } })]))).toEqual([]);
  });

  it('RYGIEL: brak aktywnej promocji → pominięta', () => {
    expect(parseFree(resp([elem({ promotions: { promotionalOffers: [] } })]))).toEqual([]);
  });

  it('fallback slug: brak catalogNs → productSlug; brak slugów → URL /free-games', () => {
    const [a] = parseFree(resp([elem({ catalogNs: undefined, productSlug: 'prod-slug' })]));
    expect(a.url).toBe('https://store.epicgames.com/p/prod-slug');
    const [b] = parseFree(
      resp([elem({ catalogNs: undefined, productSlug: undefined, urlSlug: undefined })]),
    );
    expect(b.url).toBe('https://store.epicgames.com/free-games');
  });

  it('fallback obrazka i tytułu: brak OfferImageWide → pierwszy; brak title → „Gra"', () => {
    const [a] = parseFree(
      resp([elem({ keyImages: [{ type: 'Thumbnail', url: 'https://t.jpg' }] })]),
    );
    expect(a.image).toBe('https://t.jpg');
    const [b] = parseFree(resp([elem({ title: undefined })]));
    expect(b.title).toBe('Gra');
  });
});
