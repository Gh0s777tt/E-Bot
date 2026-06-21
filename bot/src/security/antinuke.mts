// Czysty moduł Anti-Nuke (własna implementacja, bez nulled kodu).
// Detekcja przez GuildAuditLogEntryCreate + progi (X akcji / Y s) w pamięci + whitelist + kary.

import type { Client, Guild, GuildTextBasedChannel } from 'discord.js';
import { AuditLogEvent, EmbedBuilder, Events, PermissionFlagsBits } from 'discord.js';
import { getGuildSettings, setGuildSetting } from '../lib/db.mts';
import { log } from '../lib/log.mts';

export type Punishment = 'ban' | 'kick' | 'timeout' | 'strip' | 'quarantine';
export type ProtKey =
  | 'channelDelete'
  | 'channelCreate'
  | 'roleDelete'
  | 'roleCreate'
  | 'ban'
  | 'kick'
  | 'webhookCreate'
  | 'webhookDelete'
  | 'botAdd';

export type Protection = { enabled: boolean; count: number; windowSec: number };
export type AntinukeConfig = {
  enabled: boolean;
  logChannelId: string;
  punishment: Punishment;
  quarantineRoleId: string;
  whitelistUsers: string[];
  whitelistRoles: string[];
  protections: Record<ProtKey, Protection>;
};

export const PROT_LABELS: Record<ProtKey, string> = {
  channelDelete: 'Usuwanie kanałów',
  channelCreate: 'Tworzenie kanałów',
  roleDelete: 'Usuwanie ról',
  roleCreate: 'Tworzenie ról',
  ban: 'Masowe bany',
  kick: 'Masowe kicki',
  webhookCreate: 'Tworzenie webhooków',
  webhookDelete: 'Usuwanie webhooków',
  botAdd: 'Dodawanie botów',
};

export const PUNISHMENT_LABELS: Record<Punishment, string> = {
  ban: 'Ban',
  kick: 'Kick',
  timeout: 'Timeout (7 dni)',
  strip: 'Odebranie ról',
  quarantine: 'Kwarantanna',
};

function defProt(count: number, windowSec: number): Protection {
  return { enabled: true, count, windowSec };
}

export const DEFAULT_CONFIG: AntinukeConfig = {
  enabled: false,
  logChannelId: '',
  punishment: 'ban',
  quarantineRoleId: '',
  whitelistUsers: [],
  whitelistRoles: [],
  protections: {
    channelDelete: defProt(3, 10),
    channelCreate: defProt(5, 10),
    roleDelete: defProt(3, 10),
    roleCreate: defProt(5, 10),
    ban: defProt(3, 15),
    kick: defProt(4, 15),
    webhookCreate: defProt(3, 10),
    webhookDelete: defProt(3, 10),
    botAdd: defProt(1, 60),
  },
};

const ACTION_MAP: Partial<Record<AuditLogEvent, ProtKey>> = {
  [AuditLogEvent.ChannelDelete]: 'channelDelete',
  [AuditLogEvent.ChannelCreate]: 'channelCreate',
  [AuditLogEvent.RoleDelete]: 'roleDelete',
  [AuditLogEvent.RoleCreate]: 'roleCreate',
  [AuditLogEvent.MemberBanAdd]: 'ban',
  [AuditLogEvent.MemberKick]: 'kick',
  [AuditLogEvent.WebhookCreate]: 'webhookCreate',
  [AuditLogEvent.WebhookDelete]: 'webhookDelete',
  [AuditLogEvent.BotAdd]: 'botAdd',
};

function mergeConfig(stored: Partial<AntinukeConfig>): AntinukeConfig {
  const base: AntinukeConfig = structuredClone(DEFAULT_CONFIG);
  Object.assign(base, { ...stored, protections: base.protections });
  if (stored.protections) {
    for (const k of Object.keys(base.protections) as ProtKey[]) {
      if (stored.protections[k])
        base.protections[k] = { ...base.protections[k], ...stored.protections[k] };
    }
  }
  base.whitelistUsers = stored.whitelistUsers ?? [];
  base.whitelistRoles = stored.whitelistRoles ?? [];
  return base;
}

// Etap K — config per-serwer z cache TTL 15 s (Map po guildId zamiast jednej globalnej).
const cfgCache = new Map<string, { cfg: AntinukeConfig; at: number }>();

export function getConfig(guildId: string): AntinukeConfig {
  const hit = cfgCache.get(guildId);
  if (hit && Date.now() - hit.at < 15_000) return hit.cfg;
  const raw = getGuildSettings(guildId)['antinuke'];
  let cfg = structuredClone(DEFAULT_CONFIG);
  if (raw) {
    try {
      cfg = mergeConfig(JSON.parse(raw) as Partial<AntinukeConfig>);
    } catch {
      /* zła konfiguracja -> domyślne */
    }
  }
  cfgCache.set(guildId, { cfg, at: Date.now() });
  return cfg;
}

export function saveConfig(guildId: string, cfg: AntinukeConfig): void {
  setGuildSetting(guildId, 'antinuke', JSON.stringify(cfg));
  cfgCache.set(guildId, { cfg, at: Date.now() });
}

// Sliding-window licznik: klucz `${guildId}:${userId}:${prot}` -> znaczniki czasu
const hits = new Map<string, number[]>();

export function startAntiNuke(client: Client): void {
  client.on(Events.GuildAuditLogEntryCreate, async (entry, guild) => {
    try {
      const cfg = getConfig(guild.id);
      if (!cfg.enabled) return;

      // Bypass-guard kwarantanny: zdjęcie roli kwarantanny przez nieuprawnionego = kwarantanna
      // dla zdejmującego + przywrócenie roli ofierze. (Bot/owner/whitelista pomijani.)
      if (entry.action === AuditLogEvent.MemberRoleUpdate && cfg.quarantineRoleId) {
        const removedQuarantine = (entry.changes ?? []).some(
          (ch) =>
            ch.key === '$remove' &&
            Array.isArray(ch.new) &&
            (ch.new as { id?: string }[]).some((r) => r.id === cfg.quarantineRoleId),
        );
        if (removedQuarantine) {
          const execId = entry.executorId;
          const targetId = entry.targetId;
          if (
            execId &&
            targetId &&
            execId !== client.user?.id &&
            execId !== guild.ownerId &&
            !cfg.whitelistUsers.includes(execId)
          ) {
            const exec = await guild.members.fetch(execId).catch(() => null);
            const execWhitelisted = exec?.roles.cache.some((r) =>
              cfg.whitelistRoles.includes(r.id),
            );
            if (!execWhitelisted) {
              const target = await guild.members.fetch(targetId).catch(() => null);
              if (target)
                await target.roles
                  .add(cfg.quarantineRoleId, 'Anti-Nuke: przywrócenie kwarantanny (bypass-guard)')
                  .catch(() => {});
              if (exec)
                await exec.roles
                  .set([cfg.quarantineRoleId], 'Anti-Nuke: próba zdjęcia kwarantanny')
                  .catch(() => {});
              await sendBypassLog(guild, cfg, execId, targetId);
            }
          }
          return;
        }
      }

      const prot = ACTION_MAP[entry.action as AuditLogEvent];
      if (!prot) return;
      const rule = cfg.protections[prot];
      if (!rule?.enabled) return;

      const executorId = entry.executorId;
      if (!executorId) return;
      if (executorId === client.user?.id) return; // sam bot
      if (executorId === guild.ownerId) return; // właściciel serwera
      if (cfg.whitelistUsers.includes(executorId)) return;

      const member = await guild.members.fetch(executorId).catch(() => null);
      if (member && member.roles.cache.some((r) => cfg.whitelistRoles.includes(r.id))) return;

      const key = `${guild.id}:${executorId}:${prot}`;
      const now = Date.now();
      const arr = (hits.get(key) ?? []).filter((t) => now - t < rule.windowSec * 1000);
      arr.push(now);
      hits.set(key, arr);

      if (arr.length >= rule.count) {
        hits.delete(key);
        await punish(guild, executorId, cfg, prot, arr.length);
      }
    } catch (e) {
      log.warn('[antinuke]', { err: e });
    }
  });
  log.info('[antinuke] aktywny (nasłuch audit-log).');
}

async function punish(
  guild: Guild,
  userId: string,
  cfg: AntinukeConfig,
  prot: ProtKey,
  count: number,
): Promise<void> {
  const reason = `Anti-Nuke: ${PROT_LABELS[prot]} (${count} akcji)`;
  let action = 'tylko log';
  try {
    const member = await guild.members.fetch(userId).catch(() => null);
    switch (cfg.punishment) {
      case 'ban':
        await guild.bans.create(userId, { reason });
        action = 'BAN';
        break;
      case 'kick':
        if (member) {
          await member.kick(reason);
          action = 'KICK';
        }
        break;
      case 'timeout':
        if (member) {
          await member.timeout(7 * 24 * 3600 * 1000, reason);
          action = 'TIMEOUT 7 dni';
        }
        break;
      case 'strip':
        if (member) {
          await member.roles.set([], reason);
          action = 'odebrano role';
        }
        break;
      case 'quarantine':
        if (member && cfg.quarantineRoleId) {
          await member.roles.set([cfg.quarantineRoleId], reason);
          action = 'kwarantanna';
        }
        break;
    }
  } catch (e) {
    action = `NIEUDANE: ${(e as Error).message}`;
  }
  await sendLog(guild, cfg, userId, prot, count, action);
}

async function sendLog(
  guild: Guild,
  cfg: AntinukeConfig,
  userId: string,
  prot: ProtKey,
  count: number,
  action: string,
): Promise<void> {
  if (!cfg.logChannelId) return;
  const ch = await guild.channels.fetch(cfg.logChannelId).catch(() => null);
  if (!ch || !ch.isTextBased()) return;
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('🛡️ Anti-Nuke — wykryto zagrożenie')
    .setDescription(`Sprawca: <@${userId}> (\`${userId}\`)`)
    .addFields(
      { name: 'Ochrona', value: PROT_LABELS[prot], inline: true },
      { name: 'Akcji', value: String(count), inline: true },
      { name: 'Kara', value: action, inline: true },
    )
    .setTimestamp(new Date());
  await (ch as GuildTextBasedChannel).send({ embeds: [embed] }).catch(() => null);
}

async function sendBypassLog(
  guild: Guild,
  cfg: AntinukeConfig,
  execId: string,
  targetId: string,
): Promise<void> {
  if (!cfg.logChannelId) return;
  const ch = await guild.channels.fetch(cfg.logChannelId).catch(() => null);
  if (!ch || !ch.isTextBased()) return;
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('🛡️ Anti-Nuke — próba zdjęcia kwarantanny')
    .setDescription(
      `<@${execId}> próbował(a) zdjąć kwarantannę z <@${targetId}> → kwarantanna przywrócona, sprawca w kwarantannie.`,
    )
    .setTimestamp(new Date());
  await (ch as GuildTextBasedChannel).send({ embeds: [embed] }).catch(() => null);
}

// Czy bot ma uprawnienia potrzebne do działania (do /antinuke status).
export function missingPerms(guild: Guild): string[] {
  const me = guild.members.me;
  if (!me) return ['nieznane'];
  const need: [bigint, string][] = [
    [PermissionFlagsBits.ViewAuditLog, 'Wyświetlanie dziennika audytu'],
    [PermissionFlagsBits.BanMembers, 'Banowanie'],
    [PermissionFlagsBits.KickMembers, 'Wyrzucanie'],
    [PermissionFlagsBits.ModerateMembers, 'Timeout'],
    [PermissionFlagsBits.ManageRoles, 'Zarządzanie rolami'],
  ];
  return need.filter(([p]) => !me.permissions.has(p)).map(([, n]) => n);
}
