// /vote — link do głosowania na bota na top.gg (wsparcie projektu).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('vote')
  .setDescription('Zagłosuj na bota na top.gg (wsparcie projektu).');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const id = interaction.client.user.id;
  const url = `https://top.gg/bot/${id}/vote`;
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('⭐ Zagłosuj na E-Bot')
    .setURL(url)
    .setDescription(
      [
        'Wesprzyj projekt — zagłosuj na bota na **top.gg**:',
        url,
        '',
        'Głosować można **co 12 godzin**. Dzięki! ❤️',
      ].join('\n'),
    );
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
