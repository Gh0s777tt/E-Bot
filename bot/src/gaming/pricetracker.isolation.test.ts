// Test IZOLACJI RUNTIME pollera pricetracker (ITAD) — rygluje NAPRAWIONY przeciek (v0.337): lista życzeń
// była pobierana globalnie, teraz `cloudSelect('wishlist', ...guild_id=eq.<id>...)`. Centralna asercja:
// KAŻDE zapytanie o wishlistę MUSI mieć filtr `guild_id` (anty-IDOR cross-tenant — serwer A nie może
// zobaczyć listy życzeń serwera B). Plus routing per-serwer, `enabled:false`→cisza, dedup per-serwer
// `g:<id>:pricetracker_seen`. Mock chmury (cloudSelect/cloud*) + globalnego `fetch` (lookup + prices ITAD).
import type { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tick } from './pricetracker.mts';

const h = vi.hoisted(() => ({
  configs: {} as Record<string, string | undefined>,
  wishlists: {} as Record<string, Array<{ title: string }>>,
  selectCalls: [] as Array<[string, string]>,
  seenStore: {} as Record<string, string>,
  writes: [] as Array<[string, string]>,
}));

vi.mock('../lib/cloud.mts', () => ({
  hasCloud: () => true,
  cloudSelect: (table: string, query: string) => {
    h.selectCalls.push([table, query]);
    const gid = /guild_id=eq\.([^&]+)/.exec(query)?.[1];
    return Promise.resolve(gid ? (h.wishlists[gid] ?? []) : []);
  },
  cloudGetSetting: (key: string) => Promise.resolve(h.seenStore[key] ?? null),
  cloudSetSetting: (key: string, val: string) => {
    h.writes.push([key, val]);
    return Promise.resolve();
  },
}));
vi.mock('../lib/db.mts', () => ({
  getGuildSettings: (gid: string) => ({ pricetracker_config: h.configs[gid] }),
}));

const A = 'AAA111';
const B = 'BBB222';
const C = 'CCC333';

type MockChannel = { isTextBased: () => boolean; send: ReturnType<typeof vi.fn> };
const mockChannel = (): MockChannel => ({
  isTextBased: () => true,
  send: vi.fn(() => Promise.resolve()),
});
const mockGuild = (id: string, channel: MockChannel) => ({
  id,
  channels: { fetch: vi.fn((_cid: string) => Promise.resolve(channel)) },
});

let chA: MockChannel;
let chB: MockChannel;
let chC: MockChannel;
let gA: ReturnType<typeof mockGuild>;
let gB: ReturnType<typeof mockGuild>;
let gC: ReturnType<typeof mockGuild>;
let client: Client;
let prevKey: string | undefined;

beforeEach(() => {
  prevKey = process.env.ITAD_API_KEY;
  process.env.ITAD_API_KEY = 'TEST_KEY';
  h.configs = {
    [A]: JSON.stringify({ enabled: true, channelId: 'chanA' }),
    [B]: JSON.stringify({ enabled: true, channelId: 'chanB' }),
    [C]: JSON.stringify({ enabled: false, channelId: 'chanC' }), // wyłączony
  };
  h.wishlists = { [A]: [{ title: 'GameX' }], [B]: [{ title: 'GameY' }] };
  h.selectCalls = [];
  h.seenStore = {};
  h.writes = [];
  chA = mockChannel();
  chB = mockChannel();
  chC = mockChannel();
  gA = mockGuild(A, chA);
  gB = mockGuild(B, chB);
  gC = mockGuild(C, chC);
  client = {
    guilds: {
      cache: new Map([
        [A, gA],
        [B, gB],
        [C, gC],
      ]),
    },
  } as unknown as Client;

  vi.stubGlobal(
    'fetch',
    vi.fn((url: string | URL, opts?: { body?: string }) => {
      const u = String(url);
      if (u.includes('/games/lookup/')) {
        const title = new URL(u).searchParams.get('title') ?? '';
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ found: true, game: { id: `id-${title}` } }),
        });
      }
      if (u.includes('/games/prices/')) {
        const ids = JSON.parse(opts?.body ?? '[]') as string[];
        const rows = ids.map((id) => ({
          id,
          deals: [
            {
              cut: 50,
              price: { amount: 10, currency: 'PLN' },
              shop: { name: 'Steam' },
              url: 'http://d',
            },
          ],
        }));
        return Promise.resolve({ ok: true, json: () => Promise.resolve(rows) });
      }
      return Promise.resolve({ ok: false });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (prevKey === undefined) delete process.env.ITAD_API_KEY;
  else process.env.ITAD_API_KEY = prevKey;
});

describe('Izolacja runtime pollera pricetracker (ITAD) — scope wishlisty + dedup per-serwer', () => {
  it('RYGIEL anty-IDOR: KAŻDE zapytanie o wishlistę ma filtr guild_id (nigdy globalnie)', async () => {
    await tick(client);
    const wl = h.selectCalls.filter(([t]) => t === 'wishlist');
    expect(wl.length).toBeGreaterThan(0);
    expect(wl.every(([, q]) => /guild_id=eq\./.test(q))).toBe(true); // żadne zapytanie bez scope
    expect(wl.some(([, q]) => q.includes(`guild_id=eq.${A}`))).toBe(true);
    expect(wl.some(([, q]) => q.includes(`guild_id=eq.${B}`))).toBe(true);
  });

  it('serwer enabled:false nie pyta o wishlistę ani nie sięga po kanał', async () => {
    await tick(client);
    expect(h.selectCalls.some(([, q]) => q.includes(`guild_id=eq.${C}`))).toBe(false);
    expect(gC.channels.fetch).not.toHaveBeenCalled();
    expect(chC.send).not.toHaveBeenCalled();
  });

  it('routing per-serwer: post na kanał właściwego serwera (przez guild.channels.fetch)', async () => {
    await tick(client);
    expect(gA.channels.fetch).toHaveBeenCalledWith('chanA');
    expect(gB.channels.fetch).toHaveBeenCalledWith('chanB');
    expect(chA.send).toHaveBeenCalled();
    expect(chB.send).toHaveBeenCalled();
  });

  it('dedup zapisywany PER-SERWER (g:<id>:pricetracker_seen), nigdy globalnie', async () => {
    await tick(client);
    const keys = h.writes.map(([k]) => k);
    expect(keys).toContain(`g:${A}:pricetracker_seen`);
    expect(keys).toContain(`g:${B}:pricetracker_seen`);
    expect(keys).not.toContain('pricetracker_seen');
  });
});
