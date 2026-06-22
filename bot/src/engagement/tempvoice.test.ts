// Rygiel kontroli kanału tymczasowego (canControlVoice) — kto może rename/limit/lock/kick/transfer.
// Refactor behavior-preserving: predykat uprawnień wyjęty z `isController` (bez stanu `owners`).
// KLUCZ bezpieczeństwa: TYLKO właściciel LUB staff z ManageChannels. Regresja = ktoś obcy przejmuje
// sterowanie cudzym kanałem albo prawowity właściciel zostaje zablokowany. `permissions` jako string
// (niezcache'owany member z raw API) MUSI dać false (guard), nie wyjątek.
import { PermissionFlagsBits } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { canControlVoice } from './tempvoice.mts';

type Member = Parameters<typeof canControlVoice>[2];

// Mock membera: ma ManageChannels albo nie; wariant ze stringowymi permissions (niezcache'owany).
const member = (hasManage: boolean): Member =>
  ({
    permissions: { has: (p: bigint) => p === PermissionFlagsBits.ManageChannels && hasManage },
  }) as unknown as Member;
const rawMember = { permissions: 'inheritowane-stringiem' } as unknown as Member;

describe('canControlVoice — kto steruje kanałem tymczasowym', () => {
  it('właściciel → true (nawet bez uprawnień / bez membera)', () => {
    expect(canControlVoice('u1', 'u1', null)).toBe(true);
    expect(canControlVoice('u1', 'u1', member(false))).toBe(true);
  });

  it('RYGIEL staff: nie-właściciel z ManageChannels → true', () => {
    expect(canControlVoice('owner', 'staff', member(true))).toBe(true);
  });

  it('RYGIEL obcy: nie-właściciel bez ManageChannels → false (brak przejęcia)', () => {
    expect(canControlVoice('owner', 'intruz', member(false))).toBe(false);
  });

  it('nie-właściciel, member null → false', () => {
    expect(canControlVoice('owner', 'intruz', null)).toBe(false);
  });

  it("guard: permissions jako string (niezcache'owany) → false, nie wyjątek", () => {
    expect(() => canControlVoice('owner', 'intruz', rawMember)).not.toThrow();
    expect(canControlVoice('owner', 'intruz', rawMember)).toBe(false);
  });

  it('brak zarejestrowanego właściciela (undefined) + brak uprawnień → false', () => {
    expect(canControlVoice(undefined, 'ktokolwiek', member(false))).toBe(false);
    // ...ale undefined === undefined NIE może dać przejęcia komuś bez id-dopasowania:
    expect(canControlVoice(undefined, 'ktokolwiek', member(true))).toBe(true); // tylko dzięki ManageChannels
  });
});
