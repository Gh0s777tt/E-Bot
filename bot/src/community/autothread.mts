// Auto-wątki: na wybranych kanałach każda wiadomość (nie-bot, nie systemowa) dostaje własny wątek.
// Config 'autothread_config' PER-SERWER {enabled, channels[], nameTemplate}. Bez tabeli (config-only).
import { type Client, Events, type Message } from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean; channels: string[]; nameTemplate: string };
const DEFAULT: Cfg = { enabled: false, channels: [], nameTemplate: '{user} — {date}' };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId).autothread_config, DEFAULT);
}

function threadName(template: string, msg: Message): string {
  return (template || '{user} — {date}')
    .replaceAll('{user}', msg.author.username)
    .replaceAll('{date}', new Date().toISOString().slice(0, 10))
    .slice(0, 100);
}

export function startAutoThreads(client: Client): void {
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !msg.guild || msg.system || msg.hasThread) return;
    const c = cfgFor(msg.guild.id);
    if (!c.enabled || !c.channels.includes(msg.channelId)) return;
    await msg.startThread({ name: threadName(c.nameTemplate, msg) }).catch(() => {});
  });
  log.info('[autothread] auto-wątki aktywne (config z panelu).');
}
