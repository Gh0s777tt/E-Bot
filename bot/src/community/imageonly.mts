// Kanały tylko-obrazki (Etap H) — wiadomości bez załącznika/obrazka są kasowane (z krótką
// notką, auto-usuwaną po 5 s). Lista kanałów w settings 'imageonly_channels'; sterowane /imageonly.

import { type Client, Events, type Message, PermissionFlagsBits } from 'discord.js';
import { resolveGuildLocale, t } from '../i18n/index.mts';
import { getSettings, setSetting } from '../lib/db.mts';
import { log } from '../lib/log.mts';

let channels = new Set<string>();

export function refresh(): void {
  const raw = getSettings().imageonly_channels;
  try {
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    channels = new Set(Array.isArray(arr) ? (arr as string[]) : []);
  } catch {
    /* zostaw poprzednie */
  }
}

function persist(): void {
  setSetting('imageonly_channels', JSON.stringify([...channels]));
}

// Helpery dla /imageonly — zmiany natychmiastowe + zapis.
export function addImageOnly(channelId: string): void {
  channels.add(channelId);
  persist();
}
export function removeImageOnly(channelId: string): boolean {
  const had = channels.delete(channelId);
  if (had) persist();
  return had;
}
export function listImageOnly(): string[] {
  return [...channels];
}

export function hasMedia(msg: Message): boolean {
  if (msg.attachments.size > 0) return true;
  return msg.embeds.some((e) => e.image || e.thumbnail || e.video);
}

export function startImageOnly(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);

  client.on(Events.MessageCreate, async (msg: Message) => {
    if (!msg.guild || msg.author.bot || !channels.has(msg.channelId)) return;
    if (msg.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;
    // Discord buduje embedy linków z opóźnieniem — daj 1,5 s na podgląd obrazka z URL-a.
    if (!hasMedia(msg) && /https?:\/\//.test(msg.content)) {
      await new Promise((r) => setTimeout(r, 1500));
      const fresh = await msg.fetch().catch(() => null);
      if (fresh && hasMedia(fresh)) return;
    } else if (hasMedia(msg)) {
      return;
    }
    await msg.delete().catch(() => {});
    const ch = msg.channel;
    if ('send' in ch) {
      const notice = await ch
        .send(t(resolveGuildLocale(), 'imgonly.notice', { user: `<@${msg.author.id}>` }))
        .catch(() => null);
      if (notice) setTimeout(() => void notice.delete().catch(() => {}), 5000);
    }
  });

  log.info('[imageonly] aktywny (kanały tylko-obrazki; config z /imageonly).');
}
