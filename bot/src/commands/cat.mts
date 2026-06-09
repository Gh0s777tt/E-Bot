// /cat — losowe zdjęcie kota z TheCatAPI (darmowe; opcjonalny CAT_API_KEY). Graceful fail.
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;

export const data = new SlashCommandBuilder()
  .setName('cat')
  .setDescription('Losowe zdjęcie kota. 🐱');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  await interaction.deferReply();
  try {
    const key = process.env.CAT_API_KEY;
    const r = await fetch('https://api.thecatapi.com/v1/images/search', {
      headers: key ? { 'x-api-key': key } : {},
      signal: AbortSignal.timeout(8000),
    });
    const j = (await r.json()) as { url?: string }[];
    const url = j[0]?.url;
    if (!r.ok || !url) throw new Error('no cat');
    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(ACCENT).setTitle(t(locale, 'cat.title')).setImage(url)],
    });
  } catch {
    await interaction.editReply({ content: t(locale, 'cat.fail') });
  }
}
