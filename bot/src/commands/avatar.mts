// /avatar — pokaż awatar użytkownika w dużym rozmiarze (+ link).
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const ACCENT = 0xe50914;

export const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription('Pokaż awatar użytkownika.')
  .addUserOption((o) => o.setName('uzytkownik').setDescription('Czyj awatar (domyślnie Twój)'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const user = interaction.options.getUser('uzytkownik') ?? interaction.user;
  const url = user.displayAvatarURL({ size: 1024 });
  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(user.username)
    .setURL(url)
    .setImage(url);
  await interaction.reply({ embeds: [embed] });
}
