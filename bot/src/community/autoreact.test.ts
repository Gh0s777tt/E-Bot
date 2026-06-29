import { describe, expect, it } from 'vitest';
import { reactionsFor } from './autoreact.mts';

const rules = [
  { channelId: 'show', emojis: ['👍', '❤️'] },
  { channelId: 'sugg', emojis: ['⬆️', '⬇️'] },
];

describe('reactionsFor', () => {
  it('zwraca reakcje dopasowane do kanału', () => {
    expect(reactionsFor(rules, 'show')).toEqual(['👍', '❤️']);
    expect(reactionsFor(rules, 'sugg')).toEqual(['⬆️', '⬇️']);
  });

  it('brak reguły dla kanału → pusta lista', () => {
    expect(reactionsFor(rules, 'inny')).toEqual([]);
    expect(reactionsFor([], 'x')).toEqual([]);
  });

  it('przycina puste/białe znaki i ogranicza do 6', () => {
    expect(reactionsFor([{ channelId: 'a', emojis: ['🙂', '', '  ', '🔥'] }], 'a')).toEqual([
      '🙂',
      '🔥',
    ]);
    expect(
      reactionsFor([{ channelId: 'a', emojis: ['1', '2', '3', '4', '5', '6', '7', '8'] }], 'a'),
    ).toEqual(['1', '2', '3', '4', '5', '6']);
  });
});
