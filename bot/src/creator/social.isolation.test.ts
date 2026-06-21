// Test izolacji runtime social (RSS) — fetch-per-guild + dedup per-serwer `g:<id>:social_feeds_seen`
// + anty-spam „pierwszy przebieg = tylko seed". parseFeed użyty PRAWDZIWY (mock tylko fetch → XML).
import type { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tick } from './social.mts';

const h = vi.hoisted(() => ({
  configs: {} as Record<string, string | undefined>,
  seenStore: {} as Record<string, string>,
  writes: [] as Array<[string, string]>,
}));
vi.mock('../lib/cloud.mts', () => ({
  hasCloud: () => true,
  cloudGetSetting: (k: string) => Promise.resolve(h.seenStore[k] ?? null),
  cloudSetSetting: (k: string, v: string) => {
    h.writes.push([k, v]);
    return Promise.resolve();
  },
}));
vi.mock('../lib/db.mts', () => ({
  getGuildSettings: (gid: string) => ({ social_feeds_config: h.configs[gid] }),
}));

const A = 'AAA111';
const B = 'BBB222';
const C = 'CCC333';
const FEED_A = 'http://feed/a';
const FEED_B = 'http://feed/b';
const RSS =
  '<rss><channel><item><title>T</title><link>http://l/1</link><guid>item1</guid></item></channel></rss>';

type MockChannel = { isTextBased: () => boolean; send: ReturnType<typeof vi.fn> };
const mockChannel = (): MockChannel => ({
  isTextBased: () => true,
  send: vi.fn(() => Promise.resolve()),
});
const mockGuild = (id: string, ch: MockChannel) => ({
  id,
  channels: { fetch: vi.fn((_cid: string) => Promise.resolve(ch)) },
});
const cfg = (channelId: string, enabled: boolean, url: string) =>
  JSON.stringify({ enabled, channelId, feeds: [{ url, label: 'L' }] });

let chA: MockChannel;
let chB: MockChannel;
let chC: MockChannel;
let gA: ReturnType<typeof mockGuild>;
let gB: ReturnType<typeof mockGuild>;
let gC: ReturnType<typeof mockGuild>;
let client: Client;

beforeEach(() => {
  h.configs = {
    [A]: cfg('chanA', true, FEED_A),
    [B]: cfg('chanB', true, FEED_B),
    [C]: cfg('chanC', false, FEED_A),
  };
  // A: feed już widziany wcześniej (NIE pierwszy przebieg → publikuje nowy wpis).
  h.seenStore = { [`g:${A}:social_feeds_seen`]: JSON.stringify([`${FEED_A}::old`]) };
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
    vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve(RSS) })),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('Izolacja runtime social (RSS) — per-serwer + anty-spam seed', () => {
  it('dedup PER-SERWER g:<id>:social_feeds_seen (nigdy globalnie) + routing kanału', async () => {
    await tick(client);
    expect(gA.channels.fetch).toHaveBeenCalledWith('chanA');
    expect(gB.channels.fetch).toHaveBeenCalledWith('chanB');
    const keys = h.writes.map(([k]) => k);
    expect(keys).toContain(`g:${A}:social_feeds_seen`);
    expect(keys).toContain(`g:${B}:social_feeds_seen`);
    expect(keys).not.toContain('social_feeds_seen');
  });

  it('pierwszy przebieg feedu = tylko seed (B nie spamuje), znany feed publikuje (A)', async () => {
    await tick(client);
    expect(chA.send).toHaveBeenCalled(); // A: feed znany → nowy wpis opublikowany
    expect(chB.send).not.toHaveBeenCalled(); // B: pierwszy przebieg → tylko zapamiętany
  });

  it('enabled:false → cisza (brak fetch kanału)', async () => {
    await tick(client);
    expect(gC.channels.fetch).not.toHaveBeenCalled();
  });
});
