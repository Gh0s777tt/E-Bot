// Rygiel formatera relayu modmail (relayBody) — DM ↔ kanał staff. Łączy treść + URL-e załączników
// (każdy w nowej linii). KLUCZ: wiadomość tylko z załącznikiem (pusta treść) MUSI być przekazana
// (URL-e) — inaczej obrazek z DM ginie; pusta (brak treści i załączników) → placeholder, bo Discord
// nie wyśle pustej wiadomości. Wynik przycięty (trim).
import type { Message } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { relayBody } from './modmail.mts';

const msg = (content: string, urls: string[] = []): Message =>
  ({
    content,
    attachments: new Map(urls.map((u, i) => [String(i), { url: u }])),
  }) as unknown as Message;

describe('relayBody — treść relayu modmail', () => {
  it('sama treść → treść', () => {
    expect(relayBody(msg('cześć'))).toBe('cześć');
  });

  it('treść + załącznik → treść i URL w nowej linii', () => {
    expect(relayBody(msg('zobacz', ['https://cdn/x.png']))).toBe('zobacz\nhttps://cdn/x.png');
  });

  it('RYGIEL: tylko załącznik (pusta treść) → same URL-e (obrazek z DM nie ginie)', () => {
    expect(relayBody(msg('', ['https://cdn/x.png']))).toBe('https://cdn/x.png');
  });

  it('wiele załączników → każdy w osobnej linii', () => {
    expect(relayBody(msg('', ['https://a', 'https://b']))).toBe('https://a\nhttps://b');
  });

  it('RYGIEL: brak treści i załączników → placeholder (Discord nie wyśle pustej)', () => {
    expect(relayBody(msg(''))).toBe('*(brak treści)*');
    expect(relayBody(msg('   '))).toBe('*(brak treści)*'); // sam whitespace też
  });

  it('treść przycięta (trim)', () => {
    expect(relayBody(msg('  hej  '))).toBe('hej');
  });
});
