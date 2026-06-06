// /buttonpanel — publikuje na bieżącym kanale panel ról z przyciskami (konfiguracja z panelu web).
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { buildRoleRows, buttonRolesConfig } from '../engagement/buttonroles.mts';

export const data = new SlashCommandBuilder()
  .setName('buttonpanel')
  .setDescription('Wyślij panel ról z przyciskami (konfiguracja z panelu web).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cfg = buttonRolesConfig();
  if (!cfg.buttons.length) {
    await interaction.reply({
      content: '❌ Brak skonfigurowanych przycisków. Ustaw je w panelu web → Engagement.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const ch = interaction.channel as TextChannel;
  await ch.send({ content: cfg.message, components: buildRoleRows(cfg.buttons) });
  await interaction.reply({ content: '✅ Panel ról wysłany.', flags: MessageFlags.Ephemeral });
}
