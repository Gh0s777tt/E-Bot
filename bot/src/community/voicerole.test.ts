import { describe, expect, it } from 'vitest';
import { voiceRoleAction } from './voicerole.mts';

describe('voiceRoleAction', () => {
  it('wejście do głosu → add', () => {
    expect(voiceRoleAction(null, '123')).toBe('add');
  });

  it('wyjście z głosu → remove', () => {
    expect(voiceRoleAction('123', null)).toBe('remove');
  });

  it('zmiana kanału (głos→głos) → none', () => {
    expect(voiceRoleAction('123', '456')).toBe('none');
  });

  it('brak obecności / ta sama (np. mute/deaf) → none', () => {
    expect(voiceRoleAction(null, null)).toBe('none');
    expect(voiceRoleAction('123', '123')).toBe('none');
  });
});
