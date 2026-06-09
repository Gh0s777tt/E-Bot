// /flip — rzut monetą. Czysta logika (bez API).
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;

export const data = new SlashCommandBuilder()
  .setName('flip')
  .setDescription('Rzut monetą — orzeł czy reszka.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const heads = Math.random() < 0.5;
  const side = t(locale, heads ? 'flip.heads' : 'flip.tails');
  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, 'flip.title'))
    .setDescription(t(locale, 'flip.result', { side }));
  await interaction.reply({ embeds: [embed] });
}
