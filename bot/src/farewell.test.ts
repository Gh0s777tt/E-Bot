// Rygiel renderowania wiadomości pożegnań/boostu (renderVars · memberVars · farewellEmbed).
// To ścieżka user-facing: szablon z panelu + zmienne członka → embed. Regresja = niepodstawione
// {placeholdery} w wiadomości, zły format wzmianki, albo podstawienie tylko PIERWSZEGO wystąpienia.
// renderVars używa split/join (literalne replaceAll) — odporne na znaki specjalne regex w treści.
import type { GuildMember } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { farewellEmbed, memberVars, renderVars } from './farewell.mts';

describe('renderVars — literalne podstawienie wszystkich wystąpień', () => {
  it('podstawia pojedynczą zmienną', () => {
    expect(renderVars('Pa, {user}!', { '{user}': '<@1>' })).toBe('Pa, <@1>!');
  });

  it('podstawia WSZYSTKIE wystąpienia tej samej zmiennej (split/join, nie tylko pierwsze)', () => {
    expect(renderVars('{x} i znów {x} i {x}', { '{x}': 'A' })).toBe('A i znów A i A');
  });

  it('wiele różnych zmiennych naraz', () => {
    expect(
      renderVars('{user} dołączył do {server} ({memberCount})', {
        '{user}': '<@1>',
        '{server}': 'Gildia',
        '{memberCount}': '42',
      }),
    ).toBe('<@1> dołączył do Gildia (42)');
  });

  it('klucz nieobecny w treści → bez zmian', () => {
    expect(renderVars('zwykły tekst', { '{user}': '<@1>' })).toBe('zwykły tekst');
  });

  it('literalne (treść ze znakami regex .* nie psuje podstawienia)', () => {
    expect(renderVars('a.*b {x} c+d', { '{x}': 'Z' })).toBe('a.*b Z c+d');
  });

  it('pusta mapa zmiennych → treść bez zmian', () => {
    expect(renderVars('nic {tu} nie ma', {})).toBe('nic {tu} nie ma');
  });
});

// Minimalny strukturalny mock członka (renderVars/memberVars czytają tylko id/user/guild).
const mockMember = (o: {
  id: string;
  username?: string;
  guildName: string;
  memberCount: number;
}): GuildMember =>
  ({
    id: o.id,
    user: o.username === undefined ? undefined : { username: o.username },
    guild: { name: o.guildName, memberCount: o.memberCount },
  }) as unknown as GuildMember;

describe('memberVars — budowa mapy zmiennych członka', () => {
  it('komplet 4 zmiennych z poprawnym formatem wzmianki', () => {
    const v = memberVars(
      mockMember({ id: '123', username: 'Bob', guildName: 'Gildia', memberCount: 42 }),
    );
    expect(v).toEqual({
      '{user}': '<@123>',
      '{username}': 'Bob',
      '{server}': 'Gildia',
      '{memberCount}': '42',
    });
  });

  it('brak user → username fallback "user" (nie wybucha)', () => {
    const v = memberVars(mockMember({ id: '9', guildName: 'G', memberCount: 1 }));
    expect(v['{username}']).toBe('user');
    expect(v['{user}']).toBe('<@9>');
  });

  it('renderVars(memberVars) — pełna ścieżka szablon → wiadomość', () => {
    const m = mockMember({ id: '7', username: 'Ala', guildName: 'Klub', memberCount: 100 });
    expect(renderVars('Żegnaj {username}, {server} ma teraz {memberCount}.', memberVars(m))).toBe(
      'Żegnaj Ala, Klub ma teraz 100.',
    );
  });
});

describe('farewellEmbed — budowa embeda', () => {
  it('ustawia kolor i opis', () => {
    const e = farewellEmbed('treść pożegnania', 0xe50914);
    expect(e.data.description).toBe('treść pożegnania');
    expect(e.data.color).toBe(0xe50914);
  });

  it('thumbnail tylko gdy podano URL', () => {
    expect(farewellEmbed('x', 0x000000).data.thumbnail).toBeUndefined();
    expect(farewellEmbed('x', 0x000000, 'https://cdn/avatar.png').data.thumbnail?.url).toBe(
      'https://cdn/avatar.png',
    );
  });
});
