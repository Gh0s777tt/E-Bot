// Rygiel katalogu skórek kart (SKINS) — czyste dane + cross-module spójność z rendererem.
// Skórka nadpisuje globalny styl w /rank i /profile. Krytyczny, cichy tryb awarii: jeśli
// `style.font` skórki NIE jest w CARD_FONTS, renderer kart (`safeFont` w cards.mts) po cichu
// podmienia ją na Poppins — user płaci za skórkę z innym fontem i go nie dostaje. Ten test
// rygluje, że każda skórka odnosi się do realnie renderowalnego fontu + poprawność cen/kolorów.
import { describe, expect, it } from 'vitest';
import { CARD_FONTS } from '../lib/cards.mts';
import { SKINS, type Skin, skinById } from './skins.mts';

const HEX = /^#[0-9A-Fa-f]{6}$/;

describe('skins — integralność katalogu', () => {
  it('5 skórek, unikalne id, niepuste nazwy', () => {
    expect(SKINS).toHaveLength(5);
    expect(new Set(SKINS.map((s) => s.id)).size).toBe(SKINS.length);
    for (const s of SKINS) {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
    }
  });

  it('domyślna skórka "classic" istnieje i jest DARMOWA (price 0)', () => {
    const classic = skinById('classic');
    expect(classic).toBeDefined();
    expect(classic?.price).toBe(0);
  });

  it('drabina cen rośnie ściśle wg kolejności katalogu (tiery), classic jako jedyna darmowa', () => {
    const prices = SKINS.map((s) => s.price);
    expect(prices).toEqual([0, 5000, 10000, 15000, 25000]);
    for (let i = 1; i < prices.length; i++) expect(prices[i]).toBeGreaterThan(prices[i - 1]);
    expect(SKINS.filter((s) => s.price === 0)).toHaveLength(1); // tylko classic
  });
});

describe('skins — cross-module: font renderowalny (CARD_FONTS)', () => {
  it('RYGIEL: każda style.font należy do CARD_FONTS (inaczej cichy fallback na Poppins)', () => {
    const allowed = new Set<string>(CARD_FONTS);
    for (const s of SKINS) {
      expect(allowed.has(s.style.font), `${s.id}: font "${s.style.font}" spoza CARD_FONTS`).toBe(
        true,
      );
    }
  });
});

describe('skins — walidacja stylu (CardStyle)', () => {
  it('from/to/textColor = poprawny hex #RRGGBB', () => {
    for (const s of SKINS) {
      expect(s.style.from, `${s.id}.from`).toMatch(HEX);
      expect(s.style.to, `${s.id}.to`).toMatch(HEX);
      expect(s.style.textColor, `${s.id}.textColor`).toMatch(HEX);
    }
  });

  it('angle w zakresie [0, 360)', () => {
    for (const s of SKINS) {
      expect(s.style.angle).toBeGreaterThanOrEqual(0);
      expect(s.style.angle).toBeLessThan(360);
    }
  });
});

describe('skins — lookup (skinById)', () => {
  it('round-trip dla każdego id katalogu', () => {
    for (const s of SKINS) {
      expect(skinById(s.id)).toBe(s);
    }
  });

  it('nieznane id → undefined', () => {
    expect(skinById('nie-ma-takiej')).toBeUndefined();
    expect(skinById('')).toBeUndefined();
  });

  it('zwracany obiekt ma komplet pól Skin', () => {
    const s = skinById('neon') as Skin;
    expect(s).toMatchObject({ id: 'neon', name: expect.any(String), price: expect.any(Number) });
    expect(s.style).toMatchObject({
      from: expect.any(String),
      to: expect.any(String),
      angle: expect.any(Number),
      font: expect.any(String),
      textColor: expect.any(String),
    });
  });
});
