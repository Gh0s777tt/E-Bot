// Test izolacji runtime clips (Twitch) — INNY wzorzec: ŹRÓDŁO + dedup GLOBALNE ('creator_clips_last',
// jeden kanał Twitch właściciela), DESTYNACJA per-serwer (clipChannelId z creator_config). Ten sam klip
// trafia na kanał każdego serwera z relayem. Asercja odróżniająca: dedup jest GLOBALNY (brak kluczy g:<id>:).
import type { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tick } from './clips.mts';

const h = vi.hoisted(() => ({
  configs: {} as Record<string, string | undefined>,
  store: {} as Record<string, string>,
  writes: [] as Array<[string, string]>,
}));
vi.mock('../lib/cloud.mts', () => ({
  hasCloud: () => true,
  cloudGetSetting: (k: string) => Promise.resolve(h.store[k] ?? null),
  cloudSetSetting: (k: string, v: string) => {
    h.writes.push([k, v]);
    return Promise.resolve();
  },
}));
vi.mock('../lib/db.mts', () => ({
  getGuildSettings: (gid: string) => ({ creator_config: h.configs[gid] }),
}));
vi.mock('../live/tokens.mts', () => ({ twitchToken: () => Promise.resolve('tok') }));

const A = 'AAA111';
const B = 'BBB222';
const C = 'CCC333';
type MockChannel = { isTextBased: () => boolean; send: ReturnType<typeof vi.fn> };
const mockChannel = (): MockChannel => ({
  isTextBased: () => true,
  send: vi.fn(() => Promise.resolve()),
});
const mockGuild = (id: string, ch: MockChannel) => ({
  id,
  channels: { fetch: vi.fn((_cid: string) => Promise.resolve(ch)) },
});

let prevChan: string | undefined;
let prevCid: string | undefined;
let chA: MockChannel;
let chB: MockChannel;
let chC: MockChannel;
let gA: ReturnType<typeof mockGuild>;
let gB: ReturnType<typeof mockGuild>;
let gC: ReturnType<typeof mockGuild>;
let client: Client;

beforeEach(() => {
  prevChan = process.env.TWITCH_CHANNEL;
  prevCid = process.env.TWITCH_CLIENT_ID;
  process.env.TWITCH_CHANNEL = 'owner';
  process.env.TWITCH_CLIENT_ID = 'cid';
  h.configs = {
    [A]: JSON.stringify({ clipRelay: true, clipChannelId: 'chanA' }),
    [B]: JSON.stringify({ clipRelay: true, clipChannelId: 'chanB' }),
    [C]: JSON.stringify({ clipRelay: false, clipChannelId: 'chanC' }), // relay OFF
  };
  h.store = {};
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
    vi.fn((url: string | URL) => {
      const u = String(url);
      if (u.includes('/helix/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [{ id: 'bid' }] }),
        });
      }
      if (u.includes('/helix/clips')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: 'c1',
                  url: 'http://clip',
                  title: 'Klip',
                  created_at: '2099-01-01T00:00:00Z', // w przyszłości → nowszy niż lastTs
                  thumbnail_url: '',
                  creator_name: 'cre',
                },
              ],
            }),
        });
      }
      return Promise.resolve({ ok: false });
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  if (prevChan === undefined) delete process.env.TWITCH_CHANNEL;
  else process.env.TWITCH_CHANNEL = prevChan;
  if (prevCid === undefined) delete process.env.TWITCH_CLIENT_ID;
  else process.env.TWITCH_CLIENT_ID = prevCid;
});

describe('Izolacja runtime clips (Twitch) — źródło globalne, destynacja per-serwer', () => {
  it('ten sam klip trafia na kanał każdego serwera z relayem; relay OFF = cisza; dedup GLOBALNY', async () => {
    await tick(client);
    // destynacja per-serwer (każdy przez swój guild.channels.fetch)
    expect(gA.channels.fetch).toHaveBeenCalledWith('chanA');
    expect(gB.channels.fetch).toHaveBeenCalledWith('chanB');
    expect(chA.send).toHaveBeenCalled();
    expect(chB.send).toHaveBeenCalled();
    // relay wyłączony → nic
    expect(gC.channels.fetch).not.toHaveBeenCalled();
    expect(chC.send).not.toHaveBeenCalled();
    // dedup GLOBALNY (jedno źródło), świadomie NIE per-serwer
    const keys = h.writes.map(([k]) => k);
    expect(keys).toContain('creator_clips_last');
    expect(keys.some((k) => k.startsWith('g:'))).toBe(false); // brak per-serwer dedup
  });
});
