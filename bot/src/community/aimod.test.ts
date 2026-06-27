// Rygiel filtra załączników-obrazów AI-moderacji (imageUrls) — czysta selekcja wyłoniona z handlera.
// Regresja = skan nie-obrazów (koszt/błędy), brak capa (zalanie API) albo przepuszczenie za dużych plików.
import { describe, expect, it } from 'vitest';
import { imageUrls } from './aimod.mts';

const att = (contentType: string | null, url: string, size = 1000) => ({ contentType, url, size });

describe('imageUrls — wybór załączników do vision-moderacji', () => {
  it('przepuszcza tylko image/*', () => {
    expect(
      imageUrls([att('image/png', 'p.png'), att('application/pdf', 'd.pdf'), att(null, 'x')]),
    ).toEqual(['p.png']);
  });

  it('przycina do maxCount', () => {
    const many = Array.from({ length: 10 }, (_, i) => att('image/jpeg', `${i}.jpg`));
    expect(imageUrls(many, 4)).toHaveLength(4);
  });

  it('odrzuca za duże pliki', () => {
    expect(imageUrls([att('image/png', 'big.png', 9_000_000)], 4, 8_000_000)).toEqual([]);
  });

  it('brak załączników → []', () => expect(imageUrls([])).toEqual([]));
});
