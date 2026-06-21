// Test scalania configu anti-nuke (mergeConfig) — czysta funkcja. Config z panelu/komendy bywa CZĘŚCIOWY
// (JSON.parse → Partial). Regresja deep-merge = ciche zgubienie ochrony/whitelisty = dziura bezpieczeństwa
// (np. częściowa zmiana progu kanałów wyłączyłaby pozostałe ochrony). Mapuje też tylko znane klucze ochron.

import { describe, expect, it } from 'vitest';
import { type AntinukeConfig, DEFAULT_CONFIG, mergeConfig } from './antinuke.mts';

// Realne wejście to JSON.parse (kłamie o kompletności) — w teście luźny kształt przez podwójny cast.
const partial = (o: unknown) => mergeConfig(o as Partial<AntinukeConfig>);

describe('mergeConfig — scalanie configu anti-nuke z domyślnymi', () => {
  it('pusty config → pełne domyślne (wszystkie ochrony obecne)', () => {
    const c = mergeConfig({});
    expect(c.protections.channelDelete).toEqual({ enabled: true, count: 3, windowSec: 10 });
    expect(Object.keys(c.protections).sort()).toEqual(
      Object.keys(DEFAULT_CONFIG.protections).sort(),
    );
    expect(c.whitelistUsers).toEqual([]);
  });

  it('częściowa ochrona zachowuje pozostałe pola z domyślnych (deep-merge)', () => {
    const c = partial({ protections: { channelDelete: { count: 1 } } });
    // count nadpisany, ale enabled/windowSec z domyślnych — NIE wyzerowane
    expect(c.protections.channelDelete).toEqual({ enabled: true, count: 1, windowSec: 10 });
    // inne ochrony nietknięte
    expect(c.protections.roleDelete).toEqual(DEFAULT_CONFIG.protections.roleDelete);
  });

  it('top-level pola nadpisują (enabled/punishment/logChannelId), ochrony nietknięte', () => {
    const c = mergeConfig({ enabled: true, punishment: 'kick', logChannelId: 'ch1' });
    expect(c.enabled).toBe(true);
    expect(c.punishment).toBe('kick');
    expect(c.logChannelId).toBe('ch1');
    expect(c.protections.ban).toEqual(DEFAULT_CONFIG.protections.ban);
  });

  it('whitelisty: użyte gdy podane, [] gdy brak', () => {
    expect(mergeConfig({ whitelistUsers: ['u1'], whitelistRoles: ['r1'] })).toMatchObject({
      whitelistUsers: ['u1'],
      whitelistRoles: ['r1'],
    });
    expect(mergeConfig({}).whitelistRoles).toEqual([]);
  });

  it('nieznany klucz ochrony jest ignorowany (nie można wstrzyknąć bogusowej ochrony)', () => {
    const c = partial({ protections: { bogus: { enabled: true, count: 1, windowSec: 1 } } });
    expect(c.protections).not.toHaveProperty('bogus');
    expect(Object.keys(c.protections).sort()).toEqual(
      Object.keys(DEFAULT_CONFIG.protections).sort(),
    );
  });
});
