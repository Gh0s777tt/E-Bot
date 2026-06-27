// Rygiel budowania promptu co-pilota moderacji (buildModPrompt) — czysta część /modai. Regresja =
// AI dostaje pusty/zły kontekst (zła rekomendacja) albo brak rozróżnienia „czysta historia".
import { describe, expect, it } from 'vitest';
import { buildModPrompt, buildQueuePrompt } from './modai.mts';

describe('buildModPrompt — kontekst dla co-pilota', () => {
  it('pusta historia → jawna informacja o czystej historii', () => {
    expect(buildModPrompt([], 'Ala')).toContain('czysta');
  });

  it('zawiera nick, akcje i powody spraw', () => {
    const p = buildModPrompt(
      [{ action: 'warn', reason: 'spam', created_at: '2026-06-20T10:00:00Z' }],
      'Bob',
    );
    expect(p).toContain('Bob');
    expect(p).toContain('warn');
    expect(p).toContain('spam');
    expect(p).toContain('2026-06-20');
  });

  it('nagłówek pokazuje pełną liczbę, treść przycięta do 20 spraw', () => {
    const many = Array.from({ length: 30 }, () => ({ action: 'note', reason: 'x' }));
    const p = buildModPrompt(many, 'X');
    expect(p).toContain('(30 spraw');
    expect(p.split('\n').length).toBeLessThanOrEqual(21); // 1 nagłówek + max 20 linii
  });
});

describe('buildQueuePrompt — kontekst kolejki serwera', () => {
  it('pusta → informacja o spokoju', () => {
    expect(buildQueuePrompt([])).toContain('spokojnie');
  });

  it('zawiera nicki, akcje i powody', () => {
    const p = buildQueuePrompt([
      { username: 'Ala', action: 'ban', reason: 'raid', created_at: '2026-06-25T00:00:00Z' },
    ]);
    expect(p).toContain('Ala');
    expect(p).toContain('ban');
    expect(p).toContain('raid');
  });

  it('nagłówek pełna liczba, treść przycięta do 25', () => {
    const many = Array.from({ length: 40 }, () => ({ username: 'u', action: 'warn' }));
    const p = buildQueuePrompt(many);
    expect(p).toContain('(40)');
    expect(p.split('\n').length).toBeLessThanOrEqual(26); // 1 nagłówek + max 25 linii
  });
});
