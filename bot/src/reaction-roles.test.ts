// Rygiel routingu reaction-roles (emojiMatches · matchRole) — reakcja → rola. Regresja = zła rola
// nadana / żadna, albo reakcja na innej wiadomości przypina rolę. emojiMatches dopasowuje po nazwie
// (unicode), id (custom) lub pełnym mention. matchRole: najpierw reguły per-wiadomość, potem fallback
// panelu (tylko gdy to wiadomość panelu). Stan ładowany z realnego SQLite przez refresh().
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Client, MessageReaction } from 'discord.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, setSettingLocal } from './lib/db.mts';
import { emojiMatches, matchRole, refresh, refreshGuild } from './reaction-roles.mts';

const DB = path.join(tmpdir(), `ebot-rr-${process.pid}.db`);
// Config globalny (setSettingLocal) jest widziany per-serwer przez fallback getGuildSettings.
const G = 'G1';
const react = (e: { name?: string | null; id?: string | null; str?: string }): MessageReaction =>
  ({
    emoji: { name: e.name ?? null, id: e.id ?? null, toString: () => e.str ?? e.name ?? '' },
  }) as unknown as MessageReaction;

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
  if (existsSync(DB)) rmSync(DB);
});
afterAll(() => {
  closeDb();
  if (existsSync(DB)) rmSync(DB);
  delete process.env.DATABASE_PATH;
});
beforeEach(() => {
  for (const k of ['reaction_roles', 'reaction_role_panel', 'reaction_role_panel_msg'])
    setSettingLocal(k, '');
  refreshGuild(G); // czysty stan
});

describe('emojiMatches — dopasowanie emoji do konfiguracji', () => {
  it('unicode po nazwie', () => {
    expect(emojiMatches('🎮', react({ name: '🎮' }))).toBe(true);
  });

  it('custom po id i po pełnym mention', () => {
    expect(emojiMatches('123', react({ name: 'pog', id: '123', str: '<:pog:123>' }))).toBe(true);
    expect(emojiMatches('<:pog:123>', react({ name: 'pog', id: '123', str: '<:pog:123>' }))).toBe(
      true,
    );
  });

  it('inny emoji → false', () => {
    expect(emojiMatches('🎮', react({ name: '🔥' }))).toBe(false);
  });
});

describe('matchRole — reguły per-wiadomość', () => {
  it('reguła pasująca (messageId + emoji) → roleId', () => {
    setSettingLocal(
      'reaction_roles',
      JSON.stringify([{ messageId: 'M1', emoji: '🎮', roleId: 'rGamer' }]),
    );
    refreshGuild(G);
    expect(matchRole(G, 'M1', react({ name: '🎮' }))).toBe('rGamer');
  });

  it('RYGIEL izolacji wiadomości: ta sama reakcja na INNEJ wiadomości → undefined', () => {
    setSettingLocal(
      'reaction_roles',
      JSON.stringify([{ messageId: 'M1', emoji: '🎮', roleId: 'rGamer' }]),
    );
    refreshGuild(G);
    expect(matchRole(G, 'INNA', react({ name: '🎮' }))).toBeUndefined();
  });

  it('uszkodzony JSON reguł → brak dopasowania (fail-safe, nie rzuca)', () => {
    setSettingLocal('reaction_roles', '{nie-json');
    expect(() => refreshGuild(G)).not.toThrow();
    expect(matchRole(G, 'M1', react({ name: '🎮' }))).toBeUndefined();
  });
});

describe('matchRole — fallback panelu', () => {
  it('para z panelu na wiadomości panelu → roleId', () => {
    setSettingLocal(
      'reaction_role_panel',
      JSON.stringify({ pairs: [{ emoji: '🔔', roleId: 'rPing' }] }),
    );
    setSettingLocal('reaction_role_panel_msg', 'PANEL');
    refreshGuild(G);
    expect(matchRole(G, 'PANEL', react({ name: '🔔' }))).toBe('rPing');
  });

  it('para panelu, ale to NIE wiadomość panelu → undefined', () => {
    setSettingLocal(
      'reaction_role_panel',
      JSON.stringify({ pairs: [{ emoji: '🔔', roleId: 'rPing' }] }),
    );
    setSettingLocal('reaction_role_panel_msg', 'PANEL');
    refreshGuild(G);
    expect(matchRole(G, 'INNA', react({ name: '🔔' }))).toBeUndefined();
  });
});

describe('izolacja per-serwer (audyt C-1)', () => {
  it('config serwera A NIE wycieka do serwera B (override g:<id>:* na tej samej wiadomości)', () => {
    setSettingLocal(
      'g:A:reaction_roles',
      JSON.stringify([{ messageId: 'M', emoji: '🎮', roleId: 'rA' }]),
    );
    setSettingLocal(
      'g:B:reaction_roles',
      JSON.stringify([{ messageId: 'M', emoji: '🎮', roleId: 'rB' }]),
    );
    const client = {
      guilds: {
        cache: new Map([
          ['A', { id: 'A' }],
          ['B', { id: 'B' }],
        ]),
      },
    } as unknown as Client;
    refresh(client); // ładuje WSZYSTKIE serwery bota
    expect(matchRole('A', 'M', react({ name: '🎮' }))).toBe('rA');
    expect(matchRole('B', 'M', react({ name: '🎮' }))).toBe('rB'); // nie 'rA' — brak cross-tenant
  });
});
