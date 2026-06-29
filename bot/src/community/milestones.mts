// Kamienie milowe serwera: co N-tego członka bot świętuje na wybranym kanale. Config
// 'milestones_config' PER-SERWER {enabled, channelId, every, message}. Bez tabeli (config-only).
import { type Client, Events, type GuildMember, type TextChannel } from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean; channelId: string; every: number; message: string };
const DEFAULT: Cfg = {
  enabled: false,
  channelId: '',
  every: 100,
  message: '🎉 Osiągnęliśmy **{count}** członków! Witaj {user} 🎊',
};
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId)['milestones_config'], DEFAULT);
}

export function startMilestones(client: Client): void {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    const c = cfgFor(member.guild.id);
    if (!c.enabled || !c.channelId || c.every < 2) return;
    const count = member.guild.memberCount;
    if (count % c.every !== 0) return;
    const ch = await member.guild.channels.fetch(c.channelId).catch(() => null);
    if (!ch?.isTextBased() || !('send' in ch)) return;
    const text = (c.message || '🎉 Osiągnęliśmy **{count}** członków! Witaj {user} 🎊')
      .replaceAll('{count}', count.toLocaleString('pl-PL'))
      .replaceAll('{user}', `<@${member.id}>`)
      .slice(0, 2000);
    await (ch as TextChannel).send({ content: text }).catch(() => {});
  });
  log.info('[milestones] kamienie milowe aktywne (config z panelu).');
}
