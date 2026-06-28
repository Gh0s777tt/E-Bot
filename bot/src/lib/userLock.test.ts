// Rygiel per-klucz mutexa (withLock). KLUCZ: serializuje współbieżne operacje na TYM SAMYM kluczu
// (chroni read-modify-write przed wyścigiem), ale różne klucze biegną równolegle, a błąd jednej operacji
// nie psuje kolejnych w łańcuchu.
import { describe, expect, it } from 'vitest';
import { withLock } from './userLock.mts';

const tick = () => new Promise((r) => setTimeout(r, 5));

describe('withLock — per-klucz async mutex', () => {
  it('serializuje współbieżne read-modify-write na tym samym kluczu (bez wyścigu)', async () => {
    let value = 0;
    const op = () =>
      withLock('k', async () => {
        const v = value; // read
        await tick(); // okno wyścigu
        value = v + 1; // write
      });
    await Promise.all([op(), op(), op(), op(), op()]);
    expect(value).toBe(5); // bez locka byłoby 1 (wszystkie czytają 0)
  });

  it('różne klucze NIE blokują się wzajemnie (biegną równolegle)', async () => {
    const order: string[] = [];
    await Promise.all([
      withLock('a', async () => {
        await tick();
        order.push('a');
      }),
      withLock('b', async () => {
        order.push('b'); // b nie czeka na a
      }),
    ]);
    expect(order[0]).toBe('b'); // b skończyło pierwsze, mimo że zlecone drugie
  });

  it('błąd jednej operacji nie psuje kolejnych na tym samym kluczu', async () => {
    const results: string[] = [];
    const bad = withLock('k', async () => {
      throw new Error('boom');
    }).catch(() => results.push('bad-caught'));
    const good = withLock('k', async () => {
      results.push('good-ran');
    });
    await Promise.all([bad, good]);
    expect(results).toContain('bad-caught');
    expect(results).toContain('good-ran'); // kolejna operacja wykonała się mimo błędu poprzedniej
  });

  it('zwraca wynik fn wołającemu', async () => {
    await expect(withLock('k', async () => 42)).resolves.toBe(42);
  });
});
