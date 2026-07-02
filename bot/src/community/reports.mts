// Zgłaszanie wiadomości: prawym przyciskiem na wiadomość → Aplikacje → „🚩 Zgłoś wiadomość". Bot
// wysyła zgłoszenie na kanał recenzji moderacji z przyciskami „Usuń wiadomość" / „Oddal". Moderator
// (ManageMessages) decyduje. Config 'reports_config' PER-SERWER {enabled, channelId}. Bez tabeli.
import {
  ActionRowBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  ContextMenuCommandBuilder,
  EmbedBuilder,
  type MessageContextMenuCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  type TextChannel,
} from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean; channelId: string };
const DEFAULT: Cfg = { enabled: false, channelId: '' };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId).reports_config, DEFAULT);
}

// Context-menu „Zgłoś wiadomość" (typ Message) — rejestrowane w deploy-commands obok komend User.
export const reportMenuData = new ContextMenuCommandBuilder()
  .setName('🚩 Zgłoś wiadomość')
  .setType(ApplicationCommandType.Message);

// Czysta, testowalna: parsuje customId przycisku zgłoszenia (report:<action>:<chId>:<msgId>).
export function parseReportButton(
  customId: string,
): { action: 'delete' | 'dismiss'; channelId?: string; messageId?: string } | null {
  const p = customId.split(':');
  if (p[0] !== 'report') return null;
  if (p[1] === 'delete') return { action: 'delete', channelId: p[2], messageId: p[3] };
  if (p[1] === 'dismiss') return { action: 'dismiss' };
  return null;
}

function buttons(channelId: string, messageId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`report:delete:${channelId}:${messageId}`)
      .setLabel('Usuń wiadomość')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🗑️'),
    new ButtonBuilder()
      .setCustomId('report:dismiss')
      .setLabel('Oddal')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('✖️'),
  );
}

export async function handleReportMenu(
  interaction: MessageContextMenuCommandInteraction,
): Promise<void> {
  const guild = interaction.guild;
  if (!guild) return;
  const c = cfgFor(guild.id);
  if (!c.enabled || !c.channelId) {
    await interaction.reply({
      content: 'Zgłaszanie wiadomości jest wyłączone na tym serwerze.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const target = interaction.targetMessage;
  const ch = await guild.channels.fetch(c.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) {
    await interaction.reply({
      content: 'Kanał recenzji zgłoszeń jest nieprawidłowy — powiadom administrację.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('🚩 Zgłoszona wiadomość')
    .setDescription(target.content?.slice(0, 1500) || '*(brak treści — załącznik/embed)*')
    .addFields(
      { name: 'Autor', value: `${target.author} (\`${target.author.id}\`)`, inline: true },
      { name: 'Zgłaszający', value: `${interaction.user}`, inline: true },
      { name: 'Kanał', value: `<#${target.channelId}>`, inline: true },
      { name: 'Wiadomość', value: `[Skocz](${target.url})`, inline: true },
    )
    .setTimestamp(target.createdAt);
  const img = target.attachments.find((a) => a.contentType?.startsWith('image/'));
  if (img) embed.setImage(img.url);

  await (ch as TextChannel)
    .send({ embeds: [embed], components: [buttons(target.channelId, target.id)] })
    .catch(() => {});
  await interaction.reply({
    content: '✅ Zgłoszenie wysłane do moderacji. Dziękujemy!',
    flags: MessageFlags.Ephemeral,
  });
}

export async function handleReportButton(interaction: ButtonInteraction): Promise<void> {
  const parsed = parseReportButton(interaction.customId);
  if (!parsed) return;
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    await interaction.reply({
      content: '⛔ Wymagane uprawnienie: Zarządzanie wiadomościami.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.deferUpdate();
  let verdict = '✖️ Oddalone';
  if (parsed.action === 'delete' && parsed.channelId && parsed.messageId) {
    const ch = await interaction.guild?.channels.fetch(parsed.channelId).catch(() => null);
    if (ch?.isTextBased()) {
      const msg = await ch.messages.fetch(parsed.messageId).catch(() => null);
      await msg?.delete().catch(() => {});
    }
    verdict = '🗑️ Wiadomość usunięta';
  }
  const base = interaction.message.embeds[0];
  const embed = EmbedBuilder.from(base ?? new EmbedBuilder())
    .setColor(parsed.action === 'delete' ? 0x22c55e : 0x6b7280)
    .setFooter({ text: `${verdict} — ${interaction.user.tag}` });
  await interaction.editReply({ embeds: [embed], components: [] }).catch(() => {});
}
