// Rygiel serializera CSV (toCsv) — eksport audytu/statystyk. KLUCZ: poprawne cytowanie pól z
// przecinkiem/cudzysłowem/nową linią (RFC 4180), podwajanie cudzysłowów, CRLF, pusty zbiór → sam nagłówek.
import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

describe('toCsv', () => {
  it('proste pola bez znaków specjalnych — bez cytowania', () => {
    expect(toCsv(['a', 'b'], [['1', '2']])).toBe('a,b\r\n1,2');
  });

  it('pole z przecinkiem → cytowane', () => {
    expect(toCsv(['x'], [['a,b']])).toBe('x\r\n"a,b"');
  });

  it('cudzysłów w polu → podwojony i całość cytowana', () => {
    expect(toCsv(['x'], [['a"b']])).toBe('x\r\n"a""b"');
  });

  it('nowa linia w polu → cytowane', () => {
    expect(toCsv(['x'], [['a\nb']])).toBe('x\r\n"a\nb"');
  });

  it('liczby i null/undefined → string / pusto', () => {
    expect(toCsv(['n', 'z'], [[42, null]])).toBe('n,z\r\n42,');
    expect(toCsv(['n'], [[undefined]])).toBe('n\r\n');
  });

  it('pusty zbiór wierszy → sam nagłówek', () => {
    expect(toCsv(['a', 'b'], [])).toBe('a,b');
  });

  it('wiele wierszy łączone CRLF', () => {
    expect(toCsv(['a'], [['1'], ['2'], ['3']])).toBe('a\r\n1\r\n2\r\n3');
  });
});
