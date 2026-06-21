// Tor O — automatyzacje IFTTT-lite: reguły „event → akcja" z panelu (settings 'automations_config').
// Triggery: dołączenie członka, słowo-klucz. Akcje: wyślij wiadomość / nadaj rolę / wyślij DM.

import { type Client, Events, type GuildMember, type Message, type TextChannel } from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type Rule = {
  event: 'join' | 'keyword';
  keyword: string;
  action: 'message' | 'role' | 'dm';
  channelId: string;
  roleId: string;
  text: string;
};

// Etap K — config per-serwer: świeży odczyt (reguły z roleId/channelId są per-serwer), fallback global.
function rules(guildId: string): Rule[] {
  const raw = getGuildSettings(guildId)['automations_config'];
  try {
    const c = raw ? (JSON.parse(raw) as { enabled?: boolean; rules?: Rule[] }) : {};
    return c.enabled && Array.isArray(c.rules) ? c.rules : [];
  } catch {
    return [];
  }
}

const cd = new Map<string, number>();
function onCooldown(key: string): boolean {
  const now = Date.now();
  if (now - (cd.get(key) ?? 0) < 30_000) return true;
  cd.set(key, now);
  return false;
}

async function run(rule: Rule, member: GuildMember): Promise<void> {
  const text = (rule.text || '').replaceAll('{user}', `<@${member.id}>`).slice(0, 1500);
  try {
    if (rule.action === 'role' && rule.roleId) {
      await member.roles.add(rule.roleId).catch(() => {});
    } else if (rule.action === 'message' && rule.channelId) {
      const ch = await member.guild.channels.fetch(rule.channelId).catch(() => null);
      if (ch?.isTextBased() && 'send' in ch) {
        await (ch as TextChannel).send(text || '​').catch(() => {});
      }
    } else if (rule.action === 'dm') {
      await member.user.send(text || 'Cześć!').catch(() => {});
    }
  } catch {
    /* brak uprawnień / zamknięte DM — pomiń */
  }
}

export function startAutomations(client: Client): void {
  log.info('[automations] aktywne (reguły z panelu).');
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    for (const r of rules(member.guild.id)) if (r.event === 'join') await run(r, member);
  });
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !msg.guild || !msg.member) return;
    const content = msg.content.toLowerCase();
    for (const r of rules(msg.guild.id)) {
      if (r.event === 'keyword' && r.keyword && content.includes(r.keyword.toLowerCase())) {
        if (onCooldown(`${msg.author.id}|${r.keyword}`)) continue;
        await run(r, msg.member);
      }
    }
  });
}
