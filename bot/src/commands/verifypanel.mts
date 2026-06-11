// /verifypanel — publikuje na bieżącym kanale panel weryfikacji z przyciskiem (config z panelu web).
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { verifyConfig, verifyRow } from '../security/verification.mts';

export const data = new SlashCommandBuilder()
  .setName('verifypanel')
  .setDescription('Wyślij panel weryfikacji na bieżący kanał.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cfg = verifyConfig(interaction.guildId ?? '');
  const ch = interaction.channel as TextChannel | null;
  if (!ch || !('send' in ch)) {
    await interaction.reply({
      content: 'Tu nie można wysłać panelu.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!cfg.roleId) {
    await interaction.reply({
      content: '⚠️ Najpierw ustaw rolę weryfikacji w panelu (Bezpieczeństwo → Weryfikacja).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await ch.send({
    content: cfg.message || 'Zweryfikuj się poniżej. ✅',
    components: [verifyRow(cfg.buttonLabel)],
  });
  await interaction.reply({
    content: '✅ Panel weryfikacji wysłany.',
    flags: MessageFlags.Ephemeral,
  });
}
