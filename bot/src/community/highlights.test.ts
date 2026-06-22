// Rygiel rdzenia dopasowania highlightów (highlightTargets) — wyłoniony behavior-preserving z handlera
// messageCreate. KLUCZ: nie powiadamia AUTORA o jego własnej wiadomości, deduplikuje (jeden user raz
// na wiadomość, nawet gdy pasuje kilka jego słów — inaczej spam DM-ów), dopasowanie case-insensitive.
// Zwraca pierwsze pasujące słowo per-user (do treści powiadomienia). Regresja = auto-ping / spam / brak
// powiadomienia przy innej wielkości liter.
import { describe, expect, it } from 'vitest';
import { type HL, highlightTargets } from './highlights.mts';

const cache: HL[] = [
  { user_id: 'u1', word: 'deploy' },
  { user_id: 'u2', word: 'bug' },
  { user_id: 'u2', word: 'crash' },
];

describe('highlightTargets — kogo powiadomić o highlightcie', () => {
  it('dopasowuje słowo i zwraca user_id + słowo', () => {
    expect(highlightTargets(cache, 'idzie deploy na prod', 'author')).toEqual([
      { user_id: 'u1', word: 'deploy' },
    ]);
  });

  it('RYGIEL bez auto-pingu: autor nie dostaje powiadomienia o własnym słowie', () => {
    expect(highlightTargets(cache, 'robię deploy', 'u1')).toEqual([]);
  });

  it('RYGIEL dedup: user z dwoma pasującymi słowami → jeden wpis (pierwsze słowo)', () => {
    const r = highlightTargets(cache, 'mamy bug i crash', 'author');
    expect(r).toHaveLength(1);
    expect(r[0]).toEqual({ user_id: 'u2', word: 'bug' });
  });

  it('RYGIEL case-insensitive (treść): słowo „deploy" pasuje do „DEPLOY"', () => {
    expect(highlightTargets(cache, 'NAGŁY DEPLOY!', 'author').map((h) => h.user_id)).toEqual([
      'u1',
    ]);
  });

  it('RYGIEL case-insensitive (słowo): zapisane „Crash" pasuje do małych liter w treści', () => {
    const c: HL[] = [{ user_id: 'u9', word: 'Crash' }];
    expect(highlightTargets(c, 'mamy crash', 'author').map((h) => h.user_id)).toEqual(['u9']);
  });

  it('brak dopasowania → pusta lista', () => {
    expect(highlightTargets(cache, 'zwykła wiadomość', 'author')).toEqual([]);
  });

  it('wielu różnych userów dopasowanych w jednej wiadomości', () => {
    expect(highlightTargets(cache, 'deploy a potem bug', 'author').map((h) => h.user_id)).toEqual([
      'u1',
      'u2',
    ]);
  });
});
