// /ticketpanel — publikuje na kanale panel z przyciskiem otwierania ticketu (config z panelu web).
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { ticketConfig } from '../tickets/service.mts';

export const data = new SlashCommandBuilder()
  .setName('ticketpanel')
  .setDescription('Wyślij panel otwierania ticketów na bieżący kanał.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cfg = ticketConfig();
  const ch = interaction.channel as TextChannel | null;
  if (!ch || !('send' in ch)) {
    await interaction.reply({
      content: 'Tu nie można wysłać panelu.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket:new')
      .setLabel('Otwórz ticket')
      .setEmoji('🎟️')
      .setStyle(ButtonStyle.Primary),
  );
  await ch.send({
    content: cfg.panelMessage || 'Masz sprawę? Otwórz ticket poniżej. 🎟️',
    components: [row],
  });
  await interaction.reply({ content: '✅ Panel ticketów wysłany.', flags: MessageFlags.Ephemeral });
}
