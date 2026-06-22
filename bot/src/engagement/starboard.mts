// Faza 6 / B5 — starboard: reakcja ⭐ ≥ próg → repost wiadomości na kanał starboardu. Config z panelu.

import {
  type Client,
  EmbedBuilder,
  Events,
  type MessageReaction,
  type PartialMessageReaction,
  type TextChannel,
} from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

const posted = new Set<string>(); // id wiadomości już na starboardzie (dedup w pamięci)

export type StarboardConfig = { on: boolean; channelId: string; threshold: number; emoji: string };

// Parser configu starboardu (czysty) — fail-safe OFF na uszkodzony JSON, próg klamrowany ≥1
// (próg 0 wysyłałby wszystko), domyślny emoji ⭐. Wydzielony, by ryglować logikę bez bazy.
export function parseStarboardConfig(raw: string | undefined): StarboardConfig {
  try {
    const c = raw
      ? (JSON.parse(raw) as {
          enabled?: boolean;
          channelId?: string;
          threshold?: number;
          emoji?: string;
        })
      : {};
    return {
      on: !!c.enabled,
      channelId: c.channelId || '',
      threshold: Math.max(1, Number(c.threshold) || 3),
      emoji: c.emoji || '⭐',
    };
  } catch {
    return { on: false, channelId: '', threshold: 3, emoji: '⭐' };
  }
}

// Etap K — config per-serwer: świeży odczyt (kanał starboardu i tak per-serwer), fallback global.
function cfg(guildId: string): StarboardConfig {
  return parseStarboardConfig(getGuildSettings(guildId)['starboard_config']);
}

export function emojiMatches(
  reaction: MessageReaction | PartialMessageReaction,
  want: string,
): boolean {
  const e = reaction.emoji;
  return e.name === want || e.toString() === want || `${e.id}` === want;
}

export function startStarboard(client: Client): void {
  log.info('[starboard] aktywny (config z panelu).');
  client.on(Events.MessageReactionAdd, async (reaction) => {
    try {
      const c = cfg(reaction.message.guildId ?? '');
      if (!c.on || !c.channelId) return;
      if (reaction.partial) await reaction.fetch().catch(() => {});
      if (!emojiMatches(reaction, c.emoji)) return;
      if ((reaction.count ?? 0) < c.threshold) return;

      const msg = reaction.message.partial
        ? await reaction.message.fetch().catch(() => null)
        : reaction.message;
      if (!msg?.id || posted.has(msg.id)) return;
      if (msg.channelId === c.channelId) return; // nie gwiazdkuj samego starboardu
      posted.add(msg.id);

      const star = await client.channels.fetch(c.channelId).catch(() => null);
      if (!star?.isTextBased() || !('send' in star)) return;

      const embed = new EmbedBuilder()
        .setColor(0xffac33)
        .setDescription(msg.content || '*(brak treści)*')
        .addFields({ name: 'Skok', value: `[do wiadomości](${msg.url})` })
        .setFooter({ text: `${c.emoji} ${reaction.count}` })
        .setTimestamp(new Date());
      if (msg.author) {
        embed.setAuthor({ name: msg.author.username, iconURL: msg.author.displayAvatarURL() });
      }
      const image = msg.attachments?.first()?.url;
      if (image) embed.setImage(image);
      await (star as TextChannel).send({ embeds: [embed] }).catch(() => {});
    } catch (e) {
      log.warn('[starboard]', { err: e });
    }
  });
}
