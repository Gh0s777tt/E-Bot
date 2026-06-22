// Rygiel starboardu — parser configu (parseStarboardConfig) + dopasowanie emoji (emojiMatches).
// Refactor behavior-preserving: logika parsowania wyjęta z `cfg` do czystej funkcji (bez bazy).
// KLUCZ: fail-safe OFF na uszkodzony JSON + próg klamrowany ≥1 (próg 0/ujemny wysyłałby KAŻDĄ
// wiadomość na starboard = spam). emojiMatches rozstrzyga, czy reakcja w ogóle się liczy.

import type { MessageReaction } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { emojiMatches, parseStarboardConfig } from './starboard.mts';

const DEF = { on: false, channelId: '', threshold: 3, emoji: '⭐' };

describe('parseStarboardConfig — defaulty i fail-safe', () => {
  it('brak configu (undefined / "") → defaulty', () => {
    expect(parseStarboardConfig(undefined)).toEqual(DEF);
    expect(parseStarboardConfig('')).toEqual(DEF);
  });

  it('uszkodzony JSON → fail-safe OFF (nie rzuca)', () => {
    expect(() => parseStarboardConfig('{nie-json')).not.toThrow();
    expect(parseStarboardConfig('{nie-json')).toEqual(DEF);
  });

  it('enabled koercjonowane przez !! (true/brak/falsy)', () => {
    expect(parseStarboardConfig(JSON.stringify({ enabled: true })).on).toBe(true);
    expect(parseStarboardConfig(JSON.stringify({ enabled: 0 })).on).toBe(false);
    expect(parseStarboardConfig(JSON.stringify({})).on).toBe(false);
  });

  it('RYGIEL klamry progu: ujemny/ułamkowy → 1, brak/nie-liczba → 3, poprawny zachowany', () => {
    expect(parseStarboardConfig(JSON.stringify({ threshold: -5 })).threshold).toBe(1); // klamra ≥1
    expect(parseStarboardConfig(JSON.stringify({ threshold: 0.5 })).threshold).toBe(1);
    expect(parseStarboardConfig(JSON.stringify({ threshold: 0 })).threshold).toBe(3); // 0||3 → 3
    expect(parseStarboardConfig(JSON.stringify({ threshold: 'abc' })).threshold).toBe(3);
    expect(parseStarboardConfig(JSON.stringify({})).threshold).toBe(3);
    expect(parseStarboardConfig(JSON.stringify({ threshold: 10 })).threshold).toBe(10);
  });

  it('emoji domyślnie ⭐, własny zachowany; channelId domyślnie ""', () => {
    expect(parseStarboardConfig(JSON.stringify({})).emoji).toBe('⭐');
    expect(parseStarboardConfig(JSON.stringify({ emoji: '🔥' })).emoji).toBe('🔥');
    expect(parseStarboardConfig(JSON.stringify({ channelId: '123' })).channelId).toBe('123');
    expect(parseStarboardConfig(JSON.stringify({})).channelId).toBe('');
  });
});

// Minimalny mock reakcji — emojiMatches dotyka tylko reaction.emoji {name,id,toString}.
const react = (e: { name?: string | null; id?: string | null; str?: string }): MessageReaction =>
  ({
    emoji: { name: e.name ?? null, id: e.id ?? null, toString: () => e.str ?? e.name ?? '' },
  }) as unknown as MessageReaction;

describe('emojiMatches — czy reakcja liczy się do starboardu', () => {
  it('unicode po nazwie: ⭐ === ⭐', () => {
    expect(emojiMatches(react({ name: '⭐' }), '⭐')).toBe(true);
  });

  it('emoji własny po toString (<:star:123>) i po id', () => {
    expect(
      emojiMatches(react({ name: 'star', id: '123', str: '<:star:123>' }), '<:star:123>'),
    ).toBe(true);
    expect(emojiMatches(react({ name: 'star', id: '123', str: '<:star:123>' }), '123')).toBe(true);
  });

  it('inny emoji → false', () => {
    expect(emojiMatches(react({ name: '🔥' }), '⭐')).toBe(false);
    expect(
      emojiMatches(react({ name: 'fire', id: '999', str: '<:fire:999>' }), '<:star:123>'),
    ).toBe(false);
  });
});
