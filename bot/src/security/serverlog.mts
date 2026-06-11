// Faza 7 / F6.2 — logi serwera: zdarzenia (wiadomości/członkowie/bany/role/kanały/voice) → kanał logów.
// Config z panelu (settings 'logging_config'). Każda grupa zdarzeń osobno włączana. Bez chmury działa
// (czyta lokalne settings synced z panelu). Kanał logów + kanały ignorowane (dla zdarzeń wiadomości).
import {
  type Client,
  EmbedBuilder,
  Events,
  type GuildBan,
  type GuildChannel,
  type GuildMember,
  type Guild as GuildType,
  type Message,
  type PartialGuildMember,
  type PartialMessage,
  type Role,
  type TextChannel,
  type VoiceState,
} from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';

type LoggingConfig = {
  enabled: boolean;
  channelId: string;
  messages: boolean; // usunięcie / edycja / masowe usunięcie
  members: boolean; // dołączenie / wyjście
  memberUpdates: boolean; // zmiana nicku / ról
  moderation: boolean; // ban / unban
  server: boolean; // utworzenie / usunięcie kanału lub roli
  voice: boolean; // dołączenie / wyjście / przeniesienie na voice
  ignoreChannels: string[];
};

const DEFAULT: LoggingConfig = {
  enabled: false,
  channelId: '',
  messages: true,
  members: true,
  memberUpdates: false,
  moderation: true,
  server: true,
  voice: false,
  ignoreChannels: [],
};

// Paleta: czerwień = usunięcie/wyjście/ban, zieleń = utworzenie/dołączenie/unban, bursztyn = edycja/zmiana.
const RED = 0xe50914;
const GREEN = 0x3ba55d;
const AMBER = 0xfaa61a;

// Etap K — config per-serwer z cache TTL 30 s (logging reaguje na wiele zdarzeń).
const cfgCache = new Map<string, { cfg: LoggingConfig; at: number }>();
function cfgFor(guildId: string): LoggingConfig {
  const hit = cfgCache.get(guildId);
  if (hit && Date.now() - hit.at < 30_000) return hit.cfg;
  const raw = getGuildSettings(guildId)['logging_config'];
  let cfg: LoggingConfig;
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<LoggingConfig>) } : { ...DEFAULT };
  } catch {
    cfg = { ...DEFAULT };
  }
  cfgCache.set(guildId, { cfg, at: Date.now() });
  return cfg;
}

function trunc(s: string, n = 500): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

async function post(
  guild: GuildType,
  color: number,
  title: string,
  description: string,
  footer?: string,
): Promise<void> {
  const cfg = cfgFor(guild.id);
  if (!cfg.channelId) return;
  const ch = await guild.channels.fetch(cfg.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description || '—')
    .setTimestamp(new Date());
  if (footer) embed.setFooter({ text: footer });
  await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
}

export function startServerLog(client: Client): void {
  // ── Wiadomości ──
  client.on(Events.MessageDelete, async (msg: Message | PartialMessage) => {
    if (!msg.guild) return;
    const cfg = cfgFor(msg.guild.id);
    if (!cfg.enabled || !cfg.messages) return;
    if (msg.channelId === cfg.channelId || cfg.ignoreChannels.includes(msg.channelId)) return;
    if (msg.author?.bot) return;
    const who = msg.author ? `<@${msg.author.id}>` : 'nieznany (niecache’owana)';
    const body = msg.content ? trunc(msg.content) : '*(brak treści / niecache’owana)*';
    await post(
      msg.guild,
      RED,
      '🗑️ Wiadomość usunięta',
      `**Autor:** ${who}\n**Kanał:** <#${msg.channelId}>\n**Treść:** ${body}`,
      msg.author ? `ID: ${msg.author.id}` : undefined,
    );
  });

  client.on(
    Events.MessageUpdate,
    async (oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage) => {
      if (!newMsg.guild) return;
      const cfg = cfgFor(newMsg.guild.id);
      if (!cfg.enabled || !cfg.messages) return;
      if (newMsg.channelId === cfg.channelId || cfg.ignoreChannels.includes(newMsg.channelId))
        return;
      if (newMsg.author?.bot) return;
      const before = oldMsg.content ?? '';
      const after = newMsg.content ?? '';
      if (before === after) return; // sama zmiana embeda/załącznika — pomijamy
      const who = newMsg.author ? `<@${newMsg.author.id}>` : 'nieznany';
      await post(
        newMsg.guild,
        AMBER,
        '✏️ Wiadomość edytowana',
        `**Autor:** ${who}\n**Kanał:** <#${newMsg.channelId}>\n**Przed:** ${before ? trunc(before, 350) : '*(brak)*'}\n**Po:** ${after ? trunc(after, 350) : '*(brak)*'}\n[Skok do wiadomości](${newMsg.url})`,
        newMsg.author ? `ID: ${newMsg.author.id}` : undefined,
      );
    },
  );

  client.on(Events.MessageBulkDelete, async (messages) => {
    const first = messages.first();
    const guild = first?.guild;
    if (!guild) return;
    const cfg = cfgFor(guild.id);
    if (!cfg.enabled || !cfg.messages) return;
    const channelId = first?.channelId ?? '';
    if (channelId === cfg.channelId || cfg.ignoreChannels.includes(channelId)) return;
    await post(
      guild,
      RED,
      '🧹 Masowe usunięcie wiadomości',
      `**Ilość:** ${messages.size}\n**Kanał:** <#${channelId}>`,
    );
  });

  // ── Członkowie ──
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    const cfg = cfgFor(member.guild.id);
    if (!cfg.enabled || !cfg.members) return;
    const created = Math.floor(member.user.createdTimestamp / 1000);
    await post(
      member.guild,
      GREEN,
      '📥 Dołączył użytkownik',
      `**Użytkownik:** <@${member.id}> (${member.user.tag})\n**Konto utworzone:** <t:${created}:R>\n**Członków:** ${member.guild.memberCount}`,
      `ID: ${member.id}`,
    );
  });

  client.on(Events.GuildMemberRemove, async (member: GuildMember | PartialGuildMember) => {
    const cfg = cfgFor(member.guild.id);
    if (!cfg.enabled || !cfg.members) return;
    const roles = member.roles?.cache
      ? [...member.roles.cache.values()].filter((r) => r.name !== '@everyone').map((r) => r.name)
      : [];
    await post(
      member.guild,
      RED,
      '📤 Wyszedł użytkownik',
      `**Użytkownik:** <@${member.id}> (${member.user?.tag ?? member.id})\n**Role:** ${roles.length ? roles.join(', ') : '—'}`,
      `ID: ${member.id}`,
    );
  });

  client.on(
    Events.GuildMemberUpdate,
    async (oldM: GuildMember | PartialGuildMember, newM: GuildMember) => {
      const cfg = cfgFor(newM.guild.id);
      if (!cfg.enabled || !cfg.memberUpdates) return;
      const lines: string[] = [];
      if (oldM.nickname !== newM.nickname) {
        lines.push(`**Nick:** ${oldM.nickname ?? '*(brak)*'} → ${newM.nickname ?? '*(brak)*'}`);
      }
      const oldRoles = oldM.roles?.cache;
      if (oldRoles) {
        const added = [...newM.roles.cache.values()].filter((r) => !oldRoles.has(r.id));
        const removed = [...oldRoles.values()].filter((r) => !newM.roles.cache.has(r.id));
        if (added.length) lines.push(`**+ Role:** ${added.map((r) => r.name).join(', ')}`);
        if (removed.length) lines.push(`**− Role:** ${removed.map((r) => r.name).join(', ')}`);
      }
      if (!lines.length) return;
      await post(
        newM.guild,
        AMBER,
        '🔧 Zmiana członka',
        `**Użytkownik:** <@${newM.id}>\n${lines.join('\n')}`,
        `ID: ${newM.id}`,
      );
    },
  );

  // ── Moderacja (bany) ──
  client.on(Events.GuildBanAdd, async (ban: GuildBan) => {
    const cfg = cfgFor(ban.guild.id);
    if (!cfg.enabled || !cfg.moderation) return;
    await post(
      ban.guild,
      RED,
      '🔨 Ban',
      `**Użytkownik:** <@${ban.user.id}> (${ban.user.tag})\n**Powód:** ${ban.reason ? trunc(ban.reason, 300) : '—'}`,
      `ID: ${ban.user.id}`,
    );
  });

  client.on(Events.GuildBanRemove, async (ban: GuildBan) => {
    const cfg = cfgFor(ban.guild.id);
    if (!cfg.enabled || !cfg.moderation) return;
    await post(
      ban.guild,
      GREEN,
      '♻️ Unban',
      `**Użytkownik:** <@${ban.user.id}> (${ban.user.tag})`,
      `ID: ${ban.user.id}`,
    );
  });

  // ── Serwer (kanały / role) ──
  client.on(Events.ChannelCreate, async (channel: GuildChannel) => {
    if (!channel.guild) return;
    const cfg = cfgFor(channel.guild.id);
    if (!cfg.enabled || !cfg.server) return;
    await post(
      channel.guild,
      GREEN,
      '📂 Kanał utworzony',
      `**Kanał:** <#${channel.id}> (${channel.name})`,
    );
  });

  client.on(Events.ChannelDelete, async (channel) => {
    if (!('guild' in channel) || !channel.guild) return;
    const cfg = cfgFor(channel.guild.id);
    if (!cfg.enabled || !cfg.server) return;
    await post(channel.guild, RED, '📁 Kanał usunięty', `**Kanał:** #${channel.name}`);
  });

  client.on(Events.GuildRoleCreate, async (role: Role) => {
    const cfg = cfgFor(role.guild.id);
    if (!cfg.enabled || !cfg.server) return;
    await post(role.guild, GREEN, '🏷️ Rola utworzona', `**Rola:** ${role.name}`);
  });

  client.on(Events.GuildRoleDelete, async (role: Role) => {
    const cfg = cfgFor(role.guild.id);
    if (!cfg.enabled || !cfg.server) return;
    await post(role.guild, RED, '🏷️ Rola usunięta', `**Rola:** ${role.name}`);
  });

  // ── Voice ──
  client.on(Events.VoiceStateUpdate, async (oldState: VoiceState, newState: VoiceState) => {
    const guild = newState.guild;
    const cfg = cfgFor(guild.id);
    if (!cfg.enabled || !cfg.voice) return;
    const uid = newState.id;
    if (!oldState.channelId && newState.channelId) {
      await post(guild, GREEN, '🔊 Dołączył na voice', `<@${uid}> → <#${newState.channelId}>`);
    } else if (oldState.channelId && !newState.channelId) {
      await post(guild, RED, '🔇 Wyszedł z voice', `<@${uid}> ⟵ <#${oldState.channelId}>`);
    } else if (
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId !== newState.channelId
    ) {
      await post(
        guild,
        AMBER,
        '🔁 Zmiana kanału voice',
        `<@${uid}>: <#${oldState.channelId}> → <#${newState.channelId}>`,
      );
    }
  });

  console.log('[serverlog] logi serwera aktywne (config z panelu).');
}
