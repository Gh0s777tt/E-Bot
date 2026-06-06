// /afk — ustaw status AFK (czyszczony przy następnej wiadomości; wzmianka informuje innych).
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { afkEnabled, setAfk } from '../community/afk.mts';

export const data = new SlashCommandBuilder()
  .setName('afk')
  .setDescription('Ustaw swój status AFK.')
  .addStringOption((o) =>
    o.setName('powod').setDescription('Powód (opcjonalnie)').setMaxLength(200),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!afkEnabled()) {
    await interaction.reply({ content: '⚠️ AFK jest wyłączone.', flags: MessageFlags.Ephemeral });
    return;
  }
  const reason = interaction.options.getString('powod') ?? 'AFK';
  setAfk(interaction.user.id, reason);
  await interaction.reply({
    content: `💤 Ustawiono AFK: ${reason}`,
    flags: MessageFlags.Ephemeral,
  });
}
