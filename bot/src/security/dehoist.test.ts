import { describe, expect, it } from 'vitest';
import { dehoistName } from './dehoist.mts';

describe('dehoistName', () => {
  it('usuwa wiodące znaki windujące', () => {
    expect(dehoistName('!!!READ THIS')).toBe('READ THIS');
    expect(dehoistName('!John')).toBe('John');
    expect(dehoistName('   spacja')).toBe('spacja');
    expect(dehoistName('（hi）')).toBe('hi）'); // pełnoszerokie nawiasy = interpunkcja
  });

  it('zwraca null, gdy nazwa już zaczyna się od litery/cyfry (też nie-łacińskiej)', () => {
    expect(dehoistName('John')).toBeNull();
    expect(dehoistName('123abc')).toBeNull();
    expect(dehoistName('Łukasz')).toBeNull();
    expect(dehoistName('Артём')).toBeNull();
    expect(dehoistName('日本語')).toBeNull();
  });

  it('gdy zostaje pusto → fallback (też wyczyszczony)', () => {
    expect(dehoistName('!!!')).toBe('Dehoist');
    expect(dehoistName('!!!', 'Bob')).toBe('Bob');
    expect(dehoistName('~~~', '###')).toBe('Dehoist'); // fallback z samych znaków → domyślny
  });

  it('przycina do 32 znaków', () => {
    expect(dehoistName(`!${'a'.repeat(40)}`)).toHaveLength(32);
  });

  it('pusty wejściowy → null', () => {
    expect(dehoistName('')).toBeNull();
  });
});
