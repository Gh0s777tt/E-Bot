// Sticky messages — bot re-postuje wiadomość, by trzymała się dołu kanału.
// Config: settings 'sticky_config' = JSON { [channelId]: { content } }. Sterowane /sticky.
// Debounce 3 s na kanał (burst czatu = jeden repost), kasowanie poprzedniego sticky.

import {
  type Client,
  EmbedBuilder,
  Events,
  type GuildTextBasedChannel,
  type Message,
} from 'discord.js';
import { resolveGuildLocale, t } from './i18n/index.mts';
import { getSettings, setSetting } from './lib/db.mts';
import { log } from './lib/log.mts';

const ACCENT = 0xe50914;
const DEBOUNCE_MS = 3000;

type StickyEntry = { content: string };
type StickyMap = Record<string, StickyEntry>;

let cfg: StickyMap = {};
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const lastMsg = new Map<string, string>(); // channelId -> id ostatnio wysłanego sticky

function load(): StickyMap {
  const raw = getSettings().sticky_config;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as StickyMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function refresh(): void {
  cfg = load();
}

function persist(): void {
  setSetting('sticky_config', JSON.stringify(cfg));
}

function buildEmbed(content: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(resolveGuildLocale(), 'sticky.embedTitle'))
    .setDescription(content);
}

async function repost(channel: GuildTextBasedChannel): Promise<void> {
  const entry = cfg[channel.id];
  if (!entry?.content) return;
  try {
    const prevId = lastMsg.get(channel.id);
    const sent = await channel.send({ embeds: [buildEmbed(entry.content)] });
    lastMsg.set(channel.id, sent.id);
    // Skasuj poprzedni dopiero po wysłaniu nowego (brak migotania/luki).
    if (prevId && prevId !== sent.id) await channel.messages.delete(prevId).catch(() => {});
  } catch (e) {
    log.warn('[sticky] repost:', { err: e });
  }
}

function clearTimer(channelId: string): void {
  const existing = timers.get(channelId);
  if (existing) {
    clearTimeout(existing);
    timers.delete(channelId);
  }
}

function schedule(channel: GuildTextBasedChannel): void {
  clearTimer(channel.id);
  timers.set(
    channel.id,
    setTimeout(() => {
      timers.delete(channel.id);
      void repost(channel);
    }, DEBOUNCE_MS),
  );
}

// Wołane z /sticky set — natychmiastowy efekt + zapis (aktualizuje też cache w pamięci).
export async function setStickyNow(channel: GuildTextBasedChannel, content: string): Promise<void> {
  cfg[channel.id] = { content };
  persist();
  clearTimer(channel.id);
  await repost(channel);
}

// Wołane z /sticky clear — zwraca false, jeśli kanał nie miał sticky.
export async function clearStickyNow(channel: GuildTextBasedChannel): Promise<boolean> {
  if (!cfg[channel.id]) return false;
  delete cfg[channel.id];
  persist();
  clearTimer(channel.id);
  const prevId = lastMsg.get(channel.id);
  if (prevId) {
    await channel.messages.delete(prevId).catch(() => {});
    lastMsg.delete(channel.id);
  }
  return true;
}

// Wołane z /sticky list — id kanałów z aktywnym sticky.
export function listSticky(): string[] {
  return Object.keys(cfg);
}

export function startSticky(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);

  client.on(Events.MessageCreate, (msg: Message) => {
    if (msg.author.bot || !msg.guild) return; // ignoruj własny sticky (bot) + DM-y
    if (!cfg[msg.channelId]) return;
    const ch = msg.channel;
    if (!ch.isTextBased() || !('send' in ch)) return;
    schedule(ch as GuildTextBasedChannel);
  });

  log.info('[sticky] aktywny (przypięte wiadomości; config z /sticky).');
}
