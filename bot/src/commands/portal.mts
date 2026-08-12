// /portal — link to the E-Forge site + how to earn Ghost Tokens on Discord.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { ghostUrl } from '../empire/config.mts';

export const data = new SlashCommandBuilder()
  .setName('portal')
  .setDescription('Portal E-Forge + jak zarabiać Ghost Tokens na Discordzie.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  // Bez GHOST_API_URL nie ma portalu do pokazania — dawny fallback reklamował członkom cudzy
  // deployment Vercel jako „nasz" portal (i wysyłał ich tam z kodem /link). Ten sam komunikat
  // „nie jest skonfigurowana" co w /link — żadnego nowego klucza i18n.
  const base = ghostUrl();
  if (!base) {
    await interaction.reply({
      content: '⚠️ Integracja E-Forge nie jest skonfigurowana (brak `GHOST_API_URL`).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('🌐 E-Forge')
    .setURL(base)
    .setDescription(
      [
        `Portal: ${base}`,
        '',
        '**Jak zdobywać Ghost Tokens (GT) na Discordzie:**',
        '▸ Pisz na czacie i siedź na voice — GT lecą automatycznie.',
        '▸ `/link` — powiąż konto Discord z profilem na portalu (bez tego GT nie naliczą się).',
        "▸ Drop code'y, daily questy, sklep i mini-gry znajdziesz na stronie.",
      ].join('\n'),
    );
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
