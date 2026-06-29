// Przypinanie reakcją: gdy uprawniona osoba doda do wiadomości reakcję 📌 (konfigurowalne emoji), bot
// przypina tę wiadomość. Pozwala delegować przypinanie zaufanym rolom BEZ nadawania „Zarządzania
// wiadomościami". Config 'pinreact_config' PER-SERWER {enabled, emoji, roleId}. Bez tabeli.
import {
  type Client,
  Events,
  type MessageReaction,
  type PartialMessageReaction,
  type PartialUser,
  PermissionFlagsBits,
  type User,
} from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean; emoji: string; roleId: string };
const DEFAULT: Cfg = { enabled: false, emoji: '📌', roleId: '' };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId)['pinreact_config'], DEFAULT);
}

// Czysta, testowalna: czy reagujący może przypiąć. Puste `requiredRole` → wymagane „Zarządzanie
// wiadomościami"; w innym wypadku wystarczy ta rola (uprawnienie ManageMessages zawsze wystarcza).
export function canPin(roleIds: string[], manageMessages: boolean, requiredRole: string): boolean {
  if (!requiredRole) return manageMessages;
  return manageMessages || roleIds.includes(requiredRole);
}

export function startPinReact(client: Client): void {
  client.on(
    Events.MessageReactionAdd,
    async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
      try {
        if (user.bot) return;
        const gid = reaction.message.guildId;
        if (!gid) return;
        const cfg = cfgFor(gid);
        if (!cfg.enabled) return;
        const emoji = cfg.emoji || '📌';
        if (reaction.emoji.name !== emoji && reaction.emoji.toString() !== emoji) return;

        const msg = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
        if (!msg.guild || msg.pinned) return;
        const member = await msg.guild.members.fetch(user.id).catch(() => null);
        if (!member) return;
        const chan = msg.channel;
        const manage =
          'permissionsFor' in chan
            ? (chan.permissionsFor(member)?.has(PermissionFlagsBits.ManageMessages) ?? false)
            : false;
        if (!canPin([...member.roles.cache.keys()], manage, cfg.roleId)) return;

        const me = msg.guild.members.me;
        if (
          me &&
          'permissionsFor' in chan &&
          !chan.permissionsFor(me)?.has(PermissionFlagsBits.ManageMessages)
        )
          return;
        await msg.pin('Przypięto reakcją (pin-react)').catch(() => {});
      } catch (e) {
        log.warn('[pinreact]', { err: e });
      }
    },
  );
  log.info('[pinreact] przypinanie reakcją aktywne (config z panelu).');
}
