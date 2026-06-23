// Rygiel scalania configu anti-nuke panelu (mergeAnti) — panel zapisuje config, który bot czyta do
// obrony przed raidem/nuke. KLUCZ: scala TYLKO znane progi (ANTINUKE_PROTECTIONS) — zapisany config
// nie wstrzyknie obcego progu; każdy próg scalany PŁYTKO nad domyślnym (brak pola → zostaje domyślne,
// np. windowSec); whitelisty domyślnie []; klon izoluje DEFAULT. Regresja = utrata progu obrony /
// wstrzyknięcie / przeciek mutacji do DEFAULT.
import { describe, expect, it } from 'vitest';
import { ANTINUKE_DEFAULT, ANTINUKE_PROTECTIONS, mergeAnti } from './data';

describe('mergeAnti — scalanie configu anti-nuke', () => {
  it('brak zapisu → komplet 9 znanych progów (jak DEFAULT)', () => {
    const out = mergeAnti({});
    expect(Object.keys(out.protections).sort()).toEqual([...ANTINUKE_PROTECTIONS].sort());
    expect(out.enabled).toBe(false);
  });

  it('RYGIEL płytkiego scalania progu: brakujące pole zostaje domyślne', () => {
    const out = mergeAnti({ protections: { channelDelete: { count: 99 } } as never });
    // count nadpisany, ale enabled + windowSec z domyślnego (10) zachowane
    expect(out.protections.channelDelete).toEqual({ enabled: true, count: 99, windowSec: 10 });
  });

  it('RYGIEL whitelisty obcego progu: nieznany klucz w zapisie jest ignorowany', () => {
    const out = mergeAnti({ protections: { evilProtection: { count: 1 } } as never });
    expect('evilProtection' in out.protections).toBe(false);
    expect(Object.keys(out.protections).sort()).toEqual([...ANTINUKE_PROTECTIONS].sort());
  });

  it('whitelisty domyślnie [] gdy brak w zapisie', () => {
    const out = mergeAnti({ enabled: true });
    expect(out.whitelistUsers).toEqual([]);
    expect(out.whitelistRoles).toEqual([]);
  });

  it('pola top-level z zapisu nadpisują domyślne', () => {
    const out = mergeAnti({ enabled: true, punishment: 'kick', logChannelId: '123' });
    expect(out).toMatchObject({ enabled: true, punishment: 'kick', logChannelId: '123' });
  });

  it('RYGIEL izolacji klonu: mutacja wyniku nie zmienia DEFAULT', () => {
    const out = mergeAnti({});
    out.protections.ban.count = 999;
    expect(ANTINUKE_DEFAULT.protections.ban.count).toBe(3);
  });
});
