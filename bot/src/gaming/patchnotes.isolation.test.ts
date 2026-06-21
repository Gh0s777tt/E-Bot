// Test izolacji runtime patchnotes (Steam News) — wzorzec fetch-per-guild + dedup per-serwer
// `g:<id>:patchnotes_seen`. (Replikacja wzorca freegames dla kompletności pokrycia pollerów.)
import type { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tick } from './patchnotes.mts';

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
  getGuildSettings: (gid: string) => ({ patchnotes_config: h.configs[gid] }),
}));

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
const cfg = (channelId: string, enabled: boolean) =>
  JSON.stringify({ enabled, channelId, apps: [{ appId: 1, name: 'Game' }] });

let chA: MockChannel;
let chB: MockChannel;
let chC: MockChannel;
let gA: ReturnType<typeof mockGuild>;
let gB: ReturnType<typeof mockGuild>;
let gC: ReturnType<typeof mockGuild>;
let client: Client;

beforeEach(() => {
  h.configs = { [A]: cfg('chanA', true), [B]: cfg('chanB', true), [C]: cfg('chanC', false) };
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
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            appnews: {
              newsitems: [
                { gid: 'n1', title: 'Patch', url: 'http://x', contents: 'notes', date: 1 },
              ],
            },
          }),
      }),
    ),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('Izolacja runtime patchnotes (Steam News) — per-serwer', () => {
  it('routing per-serwer + dedup PER-SERWER g:<id>:patchnotes_seen (nigdy globalnie)', async () => {
    await tick(client);
    expect(gA.channels.fetch).toHaveBeenCalledWith('chanA');
    expect(gB.channels.fetch).toHaveBeenCalledWith('chanB');
    expect(chA.send).toHaveBeenCalled();
    expect(chB.send).toHaveBeenCalled();
    const keys = h.writes.map(([k]) => k);
    expect(keys).toContain(`g:${A}:patchnotes_seen`);
    expect(keys).toContain(`g:${B}:patchnotes_seen`);
    expect(keys).not.toContain('patchnotes_seen');
  });

  it('enabled:false → cisza (brak fetch kanału i wysyłki)', async () => {
    await tick(client);
    expect(gC.channels.fetch).not.toHaveBeenCalled();
    expect(chC.send).not.toHaveBeenCalled();
  });
});
