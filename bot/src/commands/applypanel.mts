// Tor K — /applypanel: publikuje panel aplikacji (przycisk „Aplikuj") na bieżącym kanale.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { applyEnabled, applyPanelMessage, applyPanelRow } from '../community/applications.mts';

export const data = new SlashCommandBuilder()
  .setName('applypanel')
  .setDescription('Opublikuj panel aplikacji/rekrutacji.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!applyEnabled()) {
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
  await (ch as TextChannel).send({ content: applyPanelMessage(), components: [applyPanelRow()] });
  await interaction.reply({
    content: '✅ Opublikowano panel aplikacji.',
    flags: MessageFlags.Ephemeral,
  });
}
