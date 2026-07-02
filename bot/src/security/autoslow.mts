// Adaptacyjny slowmode: na wybranych kanałach bot mierzy tempo wiadomości w oknie i automatycznie
// PODNOSI slowmode, gdy robi się tłoczno, a po wyciszeniu sam go ZDEJMUJE. Config 'autoslow_config'
// PER-SERWER {enabled, channels[], threshold, window, maxSlow}. Bez tabeli (config-only).
import {
  ChannelType,
  type Client,
  Events,
  type GuildBasedChannel,
  type Message,
  type NewsChannel,
  PermissionFlagsBits,
  type TextChannel,
} from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

export type AutoslowCfg = {
  enabled: boolean;
  channels: string[];
  threshold: number; // wiadomości w oknie, od którego zaczyna się throttling
  window: number; // długość okna pomiaru w sekundach
  maxSlow: number; // górny limit nakładanego slowmode w sekundach
};
const DEFAULT: AutoslowCfg = {
  enabled: false,
  channels: [],
  threshold: 8,
  window: 10,
  maxSlow: 30,
};

function cfgFor(guildId: string): AutoslowCfg {
  return mergeConfig(getGuildSettings(guildId).autoslow_config, DEFAULT);
}

// Czysta, testowalna: ile slowmode (s) przy `count` wiadomościach w oknie. Skok co krotność progu:
// <1× → 0, [1,2)× → 25% maxSlow, [2,3)× → 50%, [3,4)× → 75%, ≥4× → 100% (zaokrąglone, ograniczone).
export function computeSlowmode(count: number, threshold: number, maxSlow: number): number {
  if (threshold <= 0 || maxSlow <= 0 || count < threshold) return 0;
  const level = Math.min(4, Math.floor(count / threshold)); // 1..4
  return Math.min(maxSlow, Math.round((level / 4) * maxSlow));
}

// Per-kanał: znaczniki czasu (ms) wiadomości w oknie + ostatnio zaaplikowany slowmode (by nie spamować API).
const windows = new Map<string, number[]>();
const applied = new Map<string, number>();

// Dorzuca `now` i zwraca liczność po odcięciu znaczników starszych niż okno.
function bump(channelId: string, now: number, windowMs: number, add: boolean): number {
  const arr = (windows.get(channelId) ?? []).filter((t) => now - t < windowMs);
  if (add) arr.push(now);
  windows.set(channelId, arr);
  return arr.length;
}

type Throttleable = TextChannel | NewsChannel;
function throttleable(ch: GuildBasedChannel | null | undefined): ch is Throttleable {
  return !!ch && (ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildAnnouncement);
}

async function applySlow(ch: Throttleable, seconds: number): Promise<void> {
  const me = ch.guild.members.me;
  if (me && !ch.permissionsFor(me)?.has(PermissionFlagsBits.ManageChannels)) return;
  await ch.setRateLimitPerUser(seconds, 'auto-slowmode (adaptacyjny)').catch(() => {});
  applied.set(ch.id, seconds);
}

export function startAutoSlowmode(client: Client): void {
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !msg.guild || msg.system) return;
    const c = cfgFor(msg.guild.id);
    if (!c.enabled || !c.channels.includes(msg.channelId)) return;
    const now = Date.now();
    const count = bump(msg.channelId, now, Math.max(1, c.window) * 1000, true);
    const desired = computeSlowmode(count, c.threshold, c.maxSlow);
    // Fast-path tylko PODNOSI; zdejmowanie zostawiamy pollerowi, by nie szarpać API po każdej wiadomości.
    if (desired > (applied.get(msg.channelId) ?? 0)) {
      const ch = msg.guild.channels.cache.get(msg.channelId);
      if (throttleable(ch)) await applySlow(ch, desired);
    }
  });

  // Poller: co 15 s OBNIŻA/ZDEJMUJE slowmode na wyciszonych kanałach (gdy tempo spadło poniżej progu).
  setInterval(() => {
    void decayTick(client);
  }, 15_000);

  log.info('[autoslow] adaptacyjny slowmode aktywny (config z panelu).');
}

async function decayTick(client: Client): Promise<void> {
  const now = Date.now();
  for (const guild of client.guilds.cache.values()) {
    const c = cfgFor(guild.id);
    if (!c.enabled) continue;
    for (const channelId of c.channels) {
      const count = bump(channelId, now, Math.max(1, c.window) * 1000, false);
      const desired = computeSlowmode(count, c.threshold, c.maxSlow);
      if (desired === (applied.get(channelId) ?? 0)) continue;
      const ch = guild.channels.cache.get(channelId);
      if (throttleable(ch)) await applySlow(ch, desired);
    }
  }
}
