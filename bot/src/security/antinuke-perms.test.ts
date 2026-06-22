// Rygiel diagnozy uprawnień bota dla anti-nuke (missingPerms). /antinuke status pokazuje, czego
// botowi brakuje, by REALNIE bronić serwera. Regresja = bot raportuje „wszystko OK", a w praktyce
// nie może banować/timeoutować sprawcy (cicha dziura w obronie). Mapowanie flaga→etykieta zaryglowane.
import { type Guild, PermissionFlagsBits } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { missingPerms } from './antinuke.mts';

const ALL = [
  PermissionFlagsBits.ViewAuditLog,
  PermissionFlagsBits.BanMembers,
  PermissionFlagsBits.KickMembers,
  PermissionFlagsBits.ModerateMembers,
  PermissionFlagsBits.ManageRoles,
];

// Mock gildii: me=null albo me.permissions.has(p) sprawdza obecność flagi w nadanym zbiorze.
const mockGuild = (granted: bigint[] | null): Guild =>
  ({
    members: {
      me: granted === null ? null : { permissions: { has: (p: bigint) => granted.includes(p) } },
    },
  }) as unknown as Guild;

describe('missingPerms — czego botowi brakuje do obrony anti-nuke', () => {
  it('brak `me` (bot nie w cache) → ["nieznane"]', () => {
    expect(missingPerms(mockGuild(null))).toEqual(['nieznane']);
  });

  it('komplet 5 uprawnień → brak braków (pusta lista)', () => {
    expect(missingPerms(mockGuild(ALL))).toEqual([]);
  });

  it('brak ViewAuditLog + BanMembers → dokładnie te etykiety (w kolejności listy need)', () => {
    const granted = ALL.filter(
      (p) => p !== PermissionFlagsBits.ViewAuditLog && p !== PermissionFlagsBits.BanMembers,
    );
    expect(missingPerms(mockGuild(granted))).toEqual([
      'Wyświetlanie dziennika audytu',
      'Banowanie',
    ]);
  });

  it('brak tylko ModerateMembers → ["Timeout"]', () => {
    const granted = ALL.filter((p) => p !== PermissionFlagsBits.ModerateMembers);
    expect(missingPerms(mockGuild(granted))).toEqual(['Timeout']);
  });

  it('zero uprawnień → wszystkie 5 etykiet (kompletna lista braków)', () => {
    expect(missingPerms(mockGuild([]))).toEqual([
      'Wyświetlanie dziennika audytu',
      'Banowanie',
      'Wyrzucanie',
      'Timeout',
      'Zarządzanie rolami',
    ]);
  });
});
