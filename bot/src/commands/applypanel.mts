// Tor K / Faza 8 — /applypanel: publikuje panel aplikacji (embed z Message Studio + przycisk per aplikacja).
import {
  ActionRowBuilder,
  type APIEmbed,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { applyEnabled, buildApplyPanel, resolveApps } from '../community/applications.mts';

const STYLE = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
} as const;

export const data = new SlashCommandBuilder()
  .setName('applypanel')
  .setDescription('Opublikuj panel aplikacji/rekrutacji.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guildId = interaction.guildId ?? '';
  if (!applyEnabled(guildId)) {
    await interaction.reply({
      content: '⚠️ Najpierw włącz i skonfiguruj aplikacje w panelu (kanał recenzji + rola).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const ch = interaction.channel;
  if (!ch || !('send' in ch)) {
    await interaction.reply({
      content: 'Tu nie można opublikować.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const panel = buildApplyPanel(guildId);
  const apps = resolveApps(guildId);
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < apps.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const app of apps.slice(i, i + 5)) {
      const b = new ButtonBuilder()
        .setCustomId(`app:start:${app.id}`)
        .setLabel((app.label || 'Aplikuj').slice(0, 80))
        .setStyle(STYLE[app.style] ?? ButtonStyle.Primary);
      if (app.emoji) {
        try {
          b.setEmoji(app.emoji);
        } catch {
          /* nieprawidłowa emoji — pomiń */
        }
      }
      row.addComponents(b);
    }
    rows.push(row);
  }

  const payload: {
    content?: string;
    embeds?: APIEmbed[];
    components: ActionRowBuilder<ButtonBuilder>[];
  } = { components: rows };
  if (panel.embeds.length) payload.embeds = panel.embeds;
  if (panel.content) payload.content = panel.content;
  if (!panel.content && !panel.embeds.length) payload.content = '📋 Aplikuj poniżej.';

  try {
    await (ch as TextChannel).send(payload);
    await interaction.reply({
      content: '✅ Opublikowano panel aplikacji.',
      flags: MessageFlags.Ephemeral,
    });
  } catch (e) {
    await interaction.reply({
      content: `❌ Nie udało się opublikować: ${(e as Error).message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
