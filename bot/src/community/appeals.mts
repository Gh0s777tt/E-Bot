// System odwołań od bana. Banowany NIE może pisać na serwerze → odwołanie składa przez publiczny
// formularz panelu (tożsamość = logowanie Discordem). Trafia do kolejki 'g:<id>:appeals_queue'
// (settings JSON, bez nowej tabeli). Bot publikuje nowe pending na kanał recenzji z przyciskami;
// moderator (BanMembers) klika: zatwierdź → unban + DM, odrzuć → DM. Config 'appeals_config'
// PER-SERWER {enabled, channelId}. Poll 60 s. Wymaga chmury (współdzielona kolejka z panelem).
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type Client,
  EmbedBuilder,
  type Guild,
  MessageFlags,
  PermissionFlagsBits,
  type TextChannel,
} from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean; channelId: string };
const DEFAULT: Cfg = { enabled: false, channelId: '' };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId)['appeals_config'], DEFAULT);
}

export type Appeal = {
  id: string;
  userId: string;
  uname: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  at: number;
  posted?: boolean;
};

// Czysta: odwołania oczekujące i jeszcze nieopublikowane na kanał (do testów i pollera).
export function pendingUnposted(queue: Appeal[]): Appeal[] {
  return queue.filter((a) => a.status === 'pending' && !a.posted);
}

async function loadQueue(guildId: string): Promise<Appeal[]> {
  try {
    return JSON.parse((await cloudGetSetting(`g:${guildId}:appeals_queue`)) || '[]') as Appeal[];
  } catch {
    return [];
  }
}
async function saveQueue(guildId: string, q: Appeal[]): Promise<void> {
  await cloudSetSetting(`g:${guildId}:appeals_queue`, JSON.stringify(q.slice(-100))).catch(
    () => {},
  );
}

function buttons(id: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`appeal:approve:${id}`)
      .setLabel('Cofnij ban')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId(`appeal:reject:${id}`)
      .setLabel('Odrzuć')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('✖️'),
  );
}

async function tickForGuild(guild: Guild): Promise<void> {
  const c = cfgFor(guild.id);
  if (!c.enabled || !c.channelId) return;
  const q = await loadQueue(guild.id);
  const fresh = pendingUnposted(q);
  if (!fresh.length) return;
  const ch = await guild.channels.fetch(c.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;
  let changed = false;
  for (const a of fresh.slice(0, 5)) {
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle('📨 Nowe odwołanie od bana')
      .setDescription(a.reason.slice(0, 4000) || '—')
      .addFields({ name: 'Użytkownik', value: `${a.uname} (\`${a.userId}\`)` })
      .setTimestamp(new Date(a.at || Date.now()));
    const sent = await (ch as TextChannel)
      .send({ embeds: [embed], components: [buttons(a.id)] })
      .catch(() => null);
    if (sent) {
      a.posted = true;
      changed = true;
    }
  }
  if (changed) await saveQueue(guild.id, q);
}

export async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  for (const guild of client.guilds.cache.values()) await tickForGuild(guild).catch(() => {});
}

export function startAppeals(client: Client): void {
  if (!hasCloud()) {
    log.info('[appeals] brak chmury — system odwołań wyłączony.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(() => void tick(client).catch((e) => log.warn('[appeals]', { err: e })), 60_000);
  log.info('[appeals] system odwołań od bana aktywny (poll 60 s, config z panelu).');
}

// Moderator (BanMembers) klika „Cofnij ban"/„Odrzuć". Approve → unban + DM; reject → DM.
export async function handleAppealButton(interaction: ButtonInteraction): Promise<void> {
  const [, action, id] = interaction.customId.split(':'); // appeal:<action>:<id>
  const guild = interaction.guild;
  if (!guild || !id) return;
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
    await interaction.reply({
      content: '⛔ Wymagane uprawnienie: Banowanie członków.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const q = await loadQueue(guild.id);
  const a = q.find((x) => x.id === id);
  if (!a || a.status !== 'pending') {
    await interaction.reply({
      content: 'To odwołanie zostało już rozpatrzone.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.deferUpdate();
  const approve = action === 'approve';
  if (approve)
    await guild.bans
      .remove(a.userId, `Odwołanie zaakceptowane przez ${interaction.user.tag}`)
      .catch(() => {});
  a.status = approve ? 'approved' : 'rejected';
  await saveQueue(guild.id, q);

  const user = await interaction.client.users.fetch(a.userId).catch(() => null);
  await user
    ?.send(
      approve
        ? `✅ Twoje odwołanie na serwerze **${guild.name}** zostało przyjęte — ban cofnięty, możesz wrócić.`
        : `❌ Twoje odwołanie na serwerze **${guild.name}** zostało odrzucone.`,
    )
    .catch(() => {});

  const base = interaction.message.embeds[0];
  const embed = EmbedBuilder.from(base ?? new EmbedBuilder())
    .setColor(approve ? 0x22c55e : 0x6b7280)
    .setFooter({
      text: `${approve ? '✅ Przyjęte (ban cofnięty)' : '❌ Odrzucone'} — ${interaction.user.tag}`,
    });
  await interaction.editReply({ embeds: [embed], components: [] }).catch(() => {});
}
