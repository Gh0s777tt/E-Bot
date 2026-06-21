// Test scoringu anty-spam heat (messageHeat) — czysta funkcja, każdy czynnik osobno. Regresja wag =
// ciche fałszywe trafienia (ban niewinnych) albo przeoczenia spamu, więc warta rygla. Mockujemy tylko
// pola Message czytane przez funkcję (content, mentions.users.size, mentions.everyone, attachments.size).
import type { Message } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { messageHeat } from './heat.mts';

type Prev = Parameters<typeof messageHeat>[1];
const msg = (o: {
  content?: string;
  mentions?: number;
  everyone?: boolean;
  attachments?: number;
}): Message =>
  ({
    content: o.content ?? '',
    mentions: { users: { size: o.mentions ?? 0 }, everyone: o.everyone ?? false },
    attachments: { size: o.attachments ?? 0 },
  }) as unknown as Message;
const prevWith = (lastContent: string): Prev => ({ score: 0, lastAt: 0, lastContent });

describe('messageHeat — czynniki scoringu anty-spam', () => {
  it('baza: zwykła wiadomość = 1', () => {
    expect(messageHeat(msg({ content: 'cześć' }), undefined)).toBe(1);
  });

  it('powtórzenie tej samej treści: +3', () => {
    expect(messageHeat(msg({ content: 'spam' }), prevWith('spam'))).toBe(4);
    // inna treść → bez bonusu powtórzenia
    expect(messageHeat(msg({ content: 'spam' }), prevWith('co innego'))).toBe(1);
    // pusta treść nie liczy się jako powtórzenie
    expect(messageHeat(msg({ content: '' }), prevWith(''))).toBe(1);
  });

  it('wzmianki userów: +2 każda, ale cap +6', () => {
    expect(messageHeat(msg({ content: 'x', mentions: 1 }), undefined)).toBe(3); // 1 + 2
    expect(messageHeat(msg({ content: 'x', mentions: 2 }), undefined)).toBe(5); // 1 + 4
    expect(messageHeat(msg({ content: 'x', mentions: 9 }), undefined)).toBe(7); // 1 + cap 6
  });

  it('@everyone/@here: +8', () => {
    expect(messageHeat(msg({ content: 'x', everyone: true }), undefined)).toBe(9);
  });

  it('ściana emoji (>5): +2', () => {
    expect(messageHeat(msg({ content: '😀😀😀😀😀😀' }), undefined)).toBe(3); // 6 emoji
    expect(messageHeat(msg({ content: '😀😀😀😀😀' }), undefined)).toBe(1); // 5 = bez bonusu
  });

  it('ściana tekstu (>6 nowych linii): +2', () => {
    expect(messageHeat(msg({ content: `a${'\n'.repeat(7)}b` }), undefined)).toBe(3);
    expect(messageHeat(msg({ content: `a${'\n'.repeat(6)}b` }), undefined)).toBe(1); // 6 = bez bonusu
  });

  it('załącznik: +1, link: +2, długość >600: +1', () => {
    expect(messageHeat(msg({ content: 'x', attachments: 1 }), undefined)).toBe(2);
    expect(messageHeat(msg({ content: 'wejdź http://zle.example' }), undefined)).toBe(3);
    expect(messageHeat(msg({ content: 'a'.repeat(601) }), undefined)).toBe(2);
  });

  it('kombinacja spamu (powtórzenie + @everyone + link) kumuluje czynniki', () => {
    const score = messageHeat(
      msg({ content: 'http://zle @everyone', everyone: true }),
      prevWith('http://zle @everyone'),
    );
    expect(score).toBe(1 + 3 + 8 + 2); // baza + powtórzenie + everyone + link = 14
  });
});
