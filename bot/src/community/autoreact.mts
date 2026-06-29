// Auto-reakcje: na wybranych kanałach bot automatycznie dodaje skonfigurowane reakcje do każdej
// wiadomości (np. 👍/❤️ na kanale-prezentacji, ⬆️/⬇️ na propozycjach, 👋 na przedstawieniach).
// Config 'autoreact_config' PER-SERWER {enabled, rules:[{channelId, emojis[]}]}. Bez tabeli.
import { type Client, Events, type Message } from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

export type AutoreactRule = { channelId: string; emojis: string[] };
type Cfg = { enabled: boolean; rules: AutoreactRule[] };
const DEFAULT: Cfg = { enabled: false, rules: [] };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId)['autoreact_config'], DEFAULT);
}

// Czysta, testowalna: reakcje skonfigurowane dla kanału (max 6, by nie wpaść w limity reakcji/rate).
// Pusta lista = nic nie rób.
export function reactionsFor(rules: AutoreactRule[], channelId: string): string[] {
  const rule = rules.find((r) => r.channelId === channelId);
  return (rule?.emojis ?? [])
    .map((e) => e.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function startAutoReact(client: Client): void {
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !msg.guild || msg.system) return;
    const c = cfgFor(msg.guild.id);
    if (!c.enabled) return;
    const emojis = reactionsFor(c.rules, msg.channelId);
    if (!emojis.length) return;
    // Sekwencyjnie (kolejność reakcji + łagodniej dla rate-limitu); błędne emoji po prostu pomijamy.
    for (const e of emojis) await msg.react(e).catch(() => {});
  });
  log.info('[autoreact] auto-reakcje aktywne (config z panelu).');
}
