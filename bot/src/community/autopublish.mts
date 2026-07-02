// Auto-publikacja ogłoszeń: na wskazanych kanałach OGŁOSZEŃ (typ 5) każda nowa wiadomość jest
// automatycznie publikowana (crosspost) do serwerów obserwujących. Config 'autopublish_config'
// PER-SERWER {enabled, channels[]}. Bez tabeli (config-only). Discord limituje ~10 publikacji/h/kanał.
import { ChannelType, type Client, Events, type Message } from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean; channels: string[] };
const DEFAULT: Cfg = { enabled: false, channels: [] };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId).autopublish_config, DEFAULT);
}

export function startAutoPublish(client: Client): void {
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (!msg.guild || msg.system) return;
    if (msg.channel.type !== ChannelType.GuildAnnouncement) return;
    const c = cfgFor(msg.guild.id);
    if (!c.enabled || !c.channels.includes(msg.channelId)) return;
    await msg.crosspost().catch(() => {}); // już opublikowane / limit / brak uprawnień → cicho
  });
  log.info('[autopublish] auto-publikacja ogłoszeń aktywna (config z panelu).');
}
