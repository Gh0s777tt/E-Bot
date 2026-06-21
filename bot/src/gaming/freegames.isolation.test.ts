// Test IZOLACJI RUNTIME pollera freegames (Epic) — wprost adresuje obawę „feedy na ≥2 serwerach".
// Mockujemy chmurę (config-read przez getGuildSettings + dedup przez cloud*) i globalny `fetch` (payload
// Epic); Client/Guild/kanały to lekkie atrapy. Wołamy `tick(client)` (fetch RAZ → iteracja gildii) i pod lupą:
//   • post trafia na kanał WŁAŚCIWEGO serwera przez `guild.channels.fetch` (per-serwer, nie globalny lookup),
//   • serwer z `enabled:false` nic nie dostaje i nawet nie sięga po kanał,
//   • dedup jest PER-SERWER (`g:<id>:freegames_seen`) — „widziane" na serwerze A nie tłumi postów na B.
import type { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tick } from './freegames.mts';

const h = vi.hoisted(() => ({
  configs: {} as Record<string, string | undefined>,
  seenStore: {} as Record<string, string>,
  writes: [] as Array<[string, string]>,
}));

vi.mock('../lib/cloud.mts', () => ({
  hasCloud: () => true,
  cloudGetSetting: (key: string) => Promise.resolve(h.seenStore[key] ?? null),
  cloudSetSetting: (key: string, val: string) => {
    h.writes.push([key, val]);
    return Promise.resolve();
  },
}));
vi.mock('../lib/db.mts', () => ({
  getGuildSettings: (gid: string) => ({ freegames_config: h.configs[gid] }),
}));

const A = 'AAA111';
const B = 'BBB222';
const C = 'CCC333';

// Minimalny payload Epic: 2 darmowe gry (discountPrice 0 + aktywna oferta promocyjna).
const EPIC_PAYLOAD = {
  data: {
    Catalog: {
      searchStore: {
        elements: ['game1', 'game2'].map((id, i) => ({
          id,
          title: `Gra ${id}`,
          productSlug: `slug-${id}`,
          price: { totalPrice: { discountPrice: 0 } },
          promotions: {
            promotionalOffers: [
              { promotionalOffers: [{ endDate: `209${i}-01-01T00:00:00.000Z` }] },
            ],
          },
          keyImages: [{ type: 'OfferImageWide', url: `http://img/${id}` }],
        })),
      },
    },
  },
};

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

beforeEach(() => {
  h.configs = {
    [A]: JSON.stringify({ enabled: true, channelId: 'chanA' }),
    [B]: JSON.stringify({ enabled: true, channelId: 'chanB' }),
    [C]: JSON.stringify({ enabled: false, channelId: 'chanC' }), // wyłączony
  };
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
    vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(EPIC_PAYLOAD) })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Izolacja runtime pollera freegames (Epic) — fetch RAZ, post per-serwer', () => {
  it('post trafia na kanał właściwego serwera (każdy przez swój guild.channels.fetch)', async () => {
    await tick(client);
    expect(gA.channels.fetch).toHaveBeenCalledWith('chanA');
    expect(gB.channels.fetch).toHaveBeenCalledWith('chanB');
    expect(chA.send).toHaveBeenCalledTimes(2); // 2 darmowe gry
    expect(chB.send).toHaveBeenCalledTimes(2);
  });

  it('serwer enabled:false nic nie dostaje i nie sięga nawet po kanał', async () => {
    await tick(client);
    expect(gC.channels.fetch).not.toHaveBeenCalled();
    expect(chC.send).not.toHaveBeenCalled();
  });

  it('dedup zapisywany PER-SERWER (g:<id>:freegames_seen), nigdy globalnie', async () => {
    await tick(client);
    const keys = h.writes.map(([k]) => k);
    expect(keys).toContain(`g:${A}:freegames_seen`);
    expect(keys).toContain(`g:${B}:freegames_seen`);
    expect(keys).not.toContain('freegames_seen'); // brak zapisu globalnego
  });

  it('RYGIEL: „widziane" na serwerze A nie tłumi postów na serwerze B (dedup izolowany)', async () => {
    h.seenStore[`g:${A}:freegames_seen`] = JSON.stringify(['game1']); // A już widział game1
    await tick(client);
    expect(chA.send).toHaveBeenCalledTimes(1); // tylko game2 (game1 zdedupowany u A)
    expect(chB.send).toHaveBeenCalledTimes(2); // B nietknięty cudzym dedupem
  });
});
