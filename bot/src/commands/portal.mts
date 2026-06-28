// /portal — link to the E-Forge site + how to earn Ghost Tokens on Discord.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

const GHOST_URL = process.env.GHOST_API_URL || 'https://ghost-empire-web.vercel.app';

export const data = new SlashCommandBuilder()
  .setName('portal')
  .setDescription('Portal E-Forge + jak zarabiać Ghost Tokens na Discordzie.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('🌐 E-Forge')
    .setURL(GHOST_URL)
    .setDescription(
      [
        `Portal: ${GHOST_URL}`,
        '',
        '**Jak zdobywać Ghost Tokens (GT) na Discordzie:**',
        '▸ Pisz na czacie i siedź na voice — GT lecą automatycznie.',
        '▸ `/link` — powiąż konto Discord z profilem na portalu (bez tego GT nie naliczą się).',
        "▸ Drop code'y, daily questy, sklep i mini-gry znajdziesz na stronie.",
      ].join('\n'),
    );
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
