// Podgląd linków do wiadomości: gdy ktoś wklei link do wiadomości na tym serwerze, bot odpowiada
// embedem z jej treścią + przyciskiem „Skocz". Tylko ten sam serwer (anty-wyciek) i tylko gdy AUTOR
// linku ma dostęp do kanału źródłowego. Config 'quotelink_config' PER-SERWER {enabled}. Bez tabeli.
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type Client,
  EmbedBuilder,
  Events,
  type Message,
  PermissionFlagsBits,
} from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean };
const DEFAULT: Cfg = { enabled: false };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId)['quotelink_config'], DEFAULT);
}

export type MsgLink = { guildId: string; channelId: string; messageId: string };

// Czysta, testowalna: linki do wiadomości w treści (dedup po messageId, max 3). Pomija owinięte
// w <…> (Discord wtedy nie robi podglądu) oraz `ptb.`/`canary.`-warianty domeny obsługuje też.
export function parseMessageLinks(content: string): MsgLink[] {
  const re =
    /(<)?https?:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d{17,20})\/(\d{17,20})\/(\d{17,20})(>)?/g;
  const out: MsgLink[] = [];
  const seen = new Set<string>();
  for (const m of content.matchAll(re)) {
    if (m[1] === '<' && m[5] === '>') continue; // <link> → podgląd celowo stłumiony
    const messageId = m[4];
    if (!messageId || seen.has(messageId)) continue;
    seen.add(messageId);
    out.push({ guildId: m[2] ?? '', channelId: m[3] ?? '', messageId });
    if (out.length >= 3) break;
  }
  return out;
}

export function startQuoteLinks(client: Client): void {
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !msg.guild || msg.system || !msg.content) return;
    const c = cfgFor(msg.guild.id);
    if (!c.enabled) return;
    const links = parseMessageLinks(msg.content).filter((l) => l.guildId === msg.guild?.id);
    if (!links.length) return;
    const me = msg.guild.members.me;
    for (const link of links) {
      const ch = await msg.guild.channels.fetch(link.channelId).catch(() => null);
      if (!ch?.isTextBased()) continue;
      // Autor linku musi widzieć kanał źródłowy (nie wyciekaj treści z kanałów, do których nie ma dostępu).
      if (msg.member && !ch.permissionsFor(msg.member)?.has(PermissionFlagsBits.ViewChannel))
        continue;
      if (me && !ch.permissionsFor(me)?.has(PermissionFlagsBits.ViewChannel)) continue;
      const target = await ch.messages.fetch(link.messageId).catch(() => null);
      if (!target) continue;
      const body = target.content?.trim();
      const img = target.attachments.find((a) => a.contentType?.startsWith('image/'));
      if (!body && !img) continue;
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({
          name: target.member?.displayName ?? target.author.username,
          iconURL: target.author.displayAvatarURL(),
        })
        .setDescription(body?.slice(0, 500) || '*(załącznik)*')
        .setFooter({ text: `#${ch.name}` })
        .setTimestamp(target.createdAt);
      if (img) embed.setImage(img.url);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel('Skocz do wiadomości')
          .setURL(target.url),
      );
      await msg
        .reply({ embeds: [embed], components: [row], allowedMentions: { repliedUser: false } })
        .catch(() => {});
    }
  });
  log.info('[quotelink] podgląd linków do wiadomości aktywny (config z panelu).');
}
