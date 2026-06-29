import { describe, expect, it } from 'vitest';
import { renderJoinDm } from './joindm.mts';

describe('renderJoinDm', () => {
  it('podstawia placeholdery', () => {
    expect(
      renderJoinDm('Cześć {username}, witaj na {server}! Jesteś osobą nr {memberCount}.', {
        '{username}': 'Bob',
        '{server}': 'E-Forge',
        '{memberCount}': '100',
      }),
    ).toBe('Cześć Bob, witaj na E-Forge! Jesteś osobą nr 100.');
  });

  it('podstawia ten sam placeholder wielokrotnie', () => {
    expect(renderJoinDm('{user} {user} {user}', { '{user}': 'X' })).toBe('X X X');
  });

  it('przycina do 2000 znaków', () => {
    expect(renderJoinDm('a'.repeat(3000), {})).toHaveLength(2000);
  });

  it('brak pasujących placeholderów → tekst bez zmian', () => {
    expect(renderJoinDm('zwykły tekst', { '{x}': 'y' })).toBe('zwykły tekst');
  });
});
