// Test izolacji runtime aidigest — dzienny digest per-serwer: bramka godziny UTC, dedup per-serwer
// `g:<id>:aidigest_last` (data), izolacja kanałów źródło/cel przez guild.channels.fetch. Zegar ustawiony
// (fake timers) na 18:00 UTC; mock AI (aiConfig/callModel), chmury, getGuildSettings.
import type { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { maybePost } from './aidigest.mts';

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
  getGuildSettings: (gid: string) => ({ aidigest_config: h.configs[gid] }),
}));
vi.mock('../lib/ai.mts', () => ({
  aiConfig: () => ({ enabled: true, model: 'm' }),
  callModel: () => Promise.resolve({ text: 'streszczenie' }),
}));

const A = 'AAA111';
const B = 'BBB222';
const C = 'CCC333';
type MockChannel = {
  isTextBased: () => boolean;
  send: ReturnType<typeof vi.fn>;
  messages: { fetch: ReturnType<typeof vi.fn> };
};
const mockChannel = (): MockChannel => ({
  isTextBased: () => true,
  send: vi.fn(() => Promise.resolve()),
  messages: {
    fetch: vi.fn(() =>
      Promise.resolve(
        new Map([['1', { author: { bot: false, username: 'u' }, content: 'x'.repeat(60) }]]),
      ),
    ),
  },
});
const mockGuild = (id: string, ch: MockChannel) => ({
  id,
  channels: { fetch: vi.fn((_cid: string) => Promise.resolve(ch)) },
});
const cfg = (src: string, tgt: string, hourUTC: number, enabled = true) =>
  JSON.stringify({ enabled, sourceChannelId: src, targetChannelId: tgt, hourUTC });

let chA: MockChannel;
let chB: MockChannel;
let chC: MockChannel;
let gA: ReturnType<typeof mockGuild>;
let gB: ReturnType<typeof mockGuild>;
let gC: ReturnType<typeof mockGuild>;
let client: Client;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-01T18:00:00Z')); // 18:00 UTC
  h.configs = {
    [A]: cfg('srcA', 'tgtA', 18), // pasuje godzina
    [B]: cfg('srcB', 'tgtB', 18),
    [C]: cfg('srcC', 'tgtC', 5), // inna godzina → nie odpala
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
});
afterEach(() => {
  vi.useRealTimers();
});

describe('Izolacja runtime aidigest — godzina UTC + dedup per-serwer', () => {
  it('o właściwej godzinie: digest na kanał cel właściwego serwera; dedup PER-SERWER', async () => {
    await maybePost(client);
    expect(gA.channels.fetch).toHaveBeenCalledWith('srcA');
    expect(gA.channels.fetch).toHaveBeenCalledWith('tgtA');
    expect(chA.send).toHaveBeenCalled();
    const keys = h.writes.map(([k]) => k);
    expect(keys).toContain(`g:${A}:aidigest_last`);
    expect(keys).toContain(`g:${B}:aidigest_last`);
    expect(keys).not.toContain('aidigest_last'); // nigdy globalnie
    expect(h.writes.find(([k]) => k === `g:${A}:aidigest_last`)?.[1]).toBe('2026-07-01'); // data dnia
  });

  it('inna godzina UTC → nie odpala (nie sięga nawet po kanał)', async () => {
    await maybePost(client);
    expect(gC.channels.fetch).not.toHaveBeenCalled();
    expect(chC.send).not.toHaveBeenCalled();
  });
});
