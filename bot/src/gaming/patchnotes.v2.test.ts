// Test silnika patch-notes v2 — źródło RSS + routing PER-WPIS (własny kanał + ping roli) + UA feedu.
// Uzupełnia patchnotes.isolation.test.ts (ścieżka legacy Steam/apps). Sprawdza nowy kształt `items`.
import type { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tick } from './patchnotes.mts';

const h = vi.hoisted(() => ({
  configs: {} as Record<string, string | undefined>,
  writes: [] as Array<[string, string]>,
}));
vi.mock('../lib/cloud.mts', () => ({
  hasCloud: () => true,
  cloudGetSetting: () => Promise.resolve(null),
  cloudSetSetting: (k: string, v: string) => {
    h.writes.push([k, v]);
    return Promise.resolve();
  },
}));
vi.mock('../lib/db.mts', () => ({
  getGuildSettings: (gid: string) => ({ patchnotes_config: h.configs[gid] }),
}));

const RSS =
  '<?xml version="1.0"?><rss><channel><item><title>New League</title><link>https://poe/x</link><guid>poe-1</guid></item></channel></rss>';

const G = 'G1';
type MockChannel = { isTextBased: () => boolean; send: ReturnType<typeof vi.fn> };
const mockChannel = (): MockChannel => ({
  isTextBased: () => true,
  send: vi.fn(() => Promise.resolve()),
});
const mockGuild = (id: string, ch: MockChannel) => ({
  id,
  channels: { fetch: vi.fn((_cid: string) => Promise.resolve(ch)) },
});

let ch: MockChannel;
let guild: ReturnType<typeof mockGuild>;
let client: Client;

beforeEach(() => {
  h.writes = [];
  h.configs = {
    [G]: JSON.stringify({
      enabled: true,
      channelId: 'default',
      digest: 'instant',
      items: [
        {
          name: 'Path of Exile',
          source: { kind: 'rss', url: 'https://poe/news' },
          channelId: 'poe-chan',
          roleId: 'role1',
        },
      ],
    }),
  };
  ch = mockChannel();
  guild = mockGuild(G, ch);
  client = { guilds: { cache: new Map([[G, guild]]) } } as unknown as Client;
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve(RSS) })),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('patch-notes v2 — źródło RSS + routing per-wpis', () => {
  it('RSS → publikacja na WŁASNY kanał wpisu (override) z pingiem roli', async () => {
    await tick(client);
    expect(guild.channels.fetch).toHaveBeenCalledWith('poe-chan'); // override, nie „default"
    expect(ch.send).toHaveBeenCalled();
    const payload = ch.send.mock.calls[0]?.[0] as { content?: string; embeds?: unknown[] };
    expect(payload.content).toBe('<@&role1>');
    expect(payload.embeds).toHaveLength(1);
    expect(h.writes.map(([k]) => k)).toContain(`g:${G}:patchnotes_seen`);
  });

  it('feed RSS pobierany z UA przeglądarkowym (anty-403)', async () => {
    await tick(client);
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    const [url, opts] = fetchMock.mock.calls[0] as [string, { headers: Record<string, string> }];
    expect(url).toBe('https://poe/news');
    expect(opts.headers['user-agent']).toContain('Mozilla/5.0');
  });
});
