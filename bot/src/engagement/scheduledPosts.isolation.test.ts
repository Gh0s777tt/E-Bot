// Test scheduledPosts — DWIE warstwy: (1) logika harmonogramu `dueNow` (czysta, `now` wstrzykiwany →
// bez fake-timerów): tryby once/daily/weekly, okno catch-up 10 min, strefa Europe/Warsaw + DST,
// anty-duplikat „raz dziennie"; (2) izolacja runtime `tick`: state PER-SERWER `g:<id>:scheduled_posts_state`,
// routing przez `guild.channels.fetch`, `enabled:false`→cisza. Mock chmury/`getGuildSettings`/richMessage.
import type { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dueNow, tick } from './scheduledPosts.mts';

const h = vi.hoisted(() => ({
  configs: {} as Record<string, string | undefined>,
  stateStore: {} as Record<string, string>,
  writes: [] as Array<[string, string]>,
}));

vi.mock('../lib/cloud.mts', () => ({
  hasCloud: () => true,
  cloudGetSetting: (key: string) => Promise.resolve(h.stateStore[key] ?? null),
  cloudSetSetting: (key: string, val: string) => {
    h.writes.push([key, val]);
    return Promise.resolve();
  },
}));
vi.mock('../lib/db.mts', () => ({
  getGuildSettings: (gid: string) => ({ scheduled_posts: h.configs[gid] }),
}));
vi.mock('../lib/richMessage.mts', () => ({
  hasRich: () => true,
  buildSendOptions: () => ({ content: 'x' }),
}));

// ── (1) Logika harmonogramu — dueNow ──────────────────────────────────────────────────────
type SchedPost = Parameters<typeof dueNow>[0];
const mk = (over: Partial<SchedPost>): SchedPost => ({
  id: 'p',
  enabled: true,
  channelId: 'c',
  message: {} as SchedPost['message'],
  mode: 'daily',
  ...over,
});

describe('dueNow — logika harmonogramu (czysta, now wstrzykiwany)', () => {
  it('once: odpala gdy now ≥ runAt i nie odpalił wcześniej', () => {
    const T = Date.UTC(2026, 6, 1, 12, 0, 0);
    expect(dueNow(mk({ mode: 'once', runAt: T }), new Date(T + 1000), undefined)).toBe(true);
    expect(dueNow(mk({ mode: 'once', runAt: T }), new Date(T - 1000), undefined)).toBe(false); // przed
    expect(dueNow(mk({ mode: 'once', runAt: T }), new Date(T + 1000), T)).toBe(false); // już odpalił
  });

  it('daily: odpala tylko w oknie [cel, cel+10 min] czasu Europe/Warsaw', () => {
    const t = new Date('2026-07-01T12:00:00Z'); // CEST = 14:00 w Warszawie
    expect(dueNow(mk({ mode: 'daily', time: '14:00' }), t, undefined)).toBe(true); // delta 0
    expect(dueNow(mk({ mode: 'daily', time: '13:50' }), t, undefined)).toBe(true); // delta 10 (brzeg)
    expect(dueNow(mk({ mode: 'daily', time: '13:49' }), t, undefined)).toBe(false); // delta 11 (po oknie)
    expect(dueNow(mk({ mode: 'daily', time: '14:01' }), t, undefined)).toBe(false); // delta -1 (przed)
  });

  it('daily: DST — ta sama godzina UTC = inna godzina w Warszawie zależnie od pory roku', () => {
    const summer = new Date('2026-07-01T12:00:00Z'); // CEST (UTC+2) → 14:00
    const winter = new Date('2026-01-15T12:00:00Z'); // CET (UTC+1) → 13:00
    expect(dueNow(mk({ mode: 'daily', time: '14:00' }), summer, undefined)).toBe(true);
    expect(dueNow(mk({ mode: 'daily', time: '14:00' }), winter, undefined)).toBe(false); // zima to 13:00
    expect(dueNow(mk({ mode: 'daily', time: '13:00' }), winter, undefined)).toBe(true);
  });

  it('daily: nie odpala dwa razy tego samego dnia (Warsaw)', () => {
    const now = new Date('2026-07-01T12:00:00Z'); // 14:00 Warsaw
    const earlierToday = new Date('2026-07-01T11:55:00Z').getTime(); // ten sam dzień Warsaw
    const yesterday = new Date('2026-06-30T12:00:00Z').getTime();
    expect(dueNow(mk({ mode: 'daily', time: '14:00' }), now, earlierToday)).toBe(false); // już dziś
    expect(dueNow(mk({ mode: 'daily', time: '14:00' }), now, yesterday)).toBe(true); // wczoraj → ok
  });

  it('weekly: odpala dokładnie w jeden (właściwy) dzień tygodnia', () => {
    const now = new Date('2026-07-01T12:00:00Z'); // 14:00 Warsaw
    const due = [0, 1, 2, 3, 4, 5, 6].filter((w) =>
      dueNow(mk({ mode: 'weekly', time: '14:00', weekday: w }), now, undefined),
    );
    expect(due).toHaveLength(1); // tylko jeden weekday pasuje (gating działa)
  });
});

// ── (2) Izolacja runtime — tick ───────────────────────────────────────────────────────────
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
  name: `Guild ${id}`,
  memberCount: 10,
  channels: { fetch: vi.fn((_cid: string) => Promise.resolve(channel)) },
});
const oncePost = (channelId: string, enabled: boolean) =>
  JSON.stringify([
    { id: 'p1', enabled, channelId, message: { content: 'hi' }, mode: 'once', runAt: 1 },
  ]);

let chA: MockChannel;
let chB: MockChannel;
let chC: MockChannel;
let gA: ReturnType<typeof mockGuild>;
let gB: ReturnType<typeof mockGuild>;
let gC: ReturnType<typeof mockGuild>;
let client: Client;

beforeEach(() => {
  h.configs = {
    [A]: oncePost('chanA', true),
    [B]: oncePost('chanB', true),
    [C]: oncePost('chanC', false), // wyłączony
  };
  h.stateStore = {};
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
  vi.clearAllMocks();
});

describe('Izolacja runtime scheduledPosts — state + routing per-serwer', () => {
  it('post once (runAt w przeszłości) trafia na kanał właściwego serwera', async () => {
    await tick(client);
    expect(gA.channels.fetch).toHaveBeenCalledWith('chanA');
    expect(gB.channels.fetch).toHaveBeenCalledWith('chanB');
    expect(chA.send).toHaveBeenCalled();
    expect(chB.send).toHaveBeenCalled();
  });

  it('state zapisywany PER-SERWER (g:<id>:scheduled_posts_state), nigdy globalnie', async () => {
    await tick(client);
    const keys = h.writes.map(([k]) => k);
    expect(keys).toContain(`g:${A}:scheduled_posts_state`);
    expect(keys).toContain(`g:${B}:scheduled_posts_state`);
    expect(keys).not.toContain('scheduled_posts_state');
  });

  it('post enabled:false → cisza (brak fetch kanału i wysyłki)', async () => {
    await tick(client);
    expect(gC.channels.fetch).not.toHaveBeenCalled();
    expect(chC.send).not.toHaveBeenCalled();
  });
});
