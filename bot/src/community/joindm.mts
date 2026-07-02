// Powitalny DM: gdy ktoś dołącza do serwera, bot wysyła mu prywatną wiadomość z konfigurowalną treścią
// (regulamin, pierwsze kroki, ważne kanały). Placeholdery: {user} {username} {server} {memberCount}.
// Config 'joindm_config' PER-SERWER {enabled, message}. Bez tabeli. Uzupełnia powitania na kanale (welcome).
import { type Client, Events, type GuildMember } from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean; message: string };
const DEFAULT: Cfg = { enabled: false, message: '' };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId).joindm_config, DEFAULT);
}

// Czysta, testowalna: podstawia placeholdery i przycina do limitu wiadomości DM (2000 znaków).
export function renderJoinDm(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) out = out.split(k).join(v);
  return out.slice(0, 2000);
}

export function startJoinDm(client: Client): void {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    const c = cfgFor(member.guild.id);
    if (!c.enabled || !c.message.trim()) return;
    const text = renderJoinDm(c.message, {
      '{user}': `<@${member.id}>`,
      '{username}': member.user.username,
      '{server}': member.guild.name,
      '{memberCount}': String(member.guild.memberCount),
    });
    // DM mogą być zamknięte — nie spamujemy kanałów, po prostu cicho pomijamy.
    if (text.trim()) await member.send(text).catch(() => {});
  });
  log.info('[joindm] powitalny DM aktywny (config z panelu).');
}
