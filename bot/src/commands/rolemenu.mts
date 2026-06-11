// Tor F — /rolemenu: publikuje menu wyboru ról (dropdown) na bieżącym kanale. Config w panelu → Role.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { buildRoleMenu, roleMenuConfig } from '../engagement/rolemenu.mts';

export const data = new SlashCommandBuilder()
  .setName('rolemenu')
  .setDescription('Opublikuj menu wyboru ról (dropdown).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const row = buildRoleMenu(interaction.guildId ?? '');
  if (!row) {
    await interaction.reply({
      content: '⚠️ Najpierw skonfiguruj role w panelu → Role (menu ról).',
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
  await (ch as TextChannel).send({
    content: roleMenuConfig(interaction.guildId ?? '').message,
    components: [row],
  });
  await interaction.reply({ content: '✅ Opublikowano menu ról.', flags: MessageFlags.Ephemeral });
}
