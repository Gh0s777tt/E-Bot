// /dog — losowe zdjęcie psa z dog.ceo (darmowe, bez klucza). Graceful fail.
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;

export const data = new SlashCommandBuilder()
  .setName('dog')
  .setDescription('Losowe zdjęcie psa. 🐶');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  await interaction.deferReply();
  try {
    const r = await fetch('https://dog.ceo/api/breeds/image/random', {
      signal: AbortSignal.timeout(8000),
    });
    const j = (await r.json()) as { message?: string; status?: string };
    const url = j.status === 'success' ? j.message : undefined;
    if (!r.ok || !url) throw new Error('no dog');
    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(ACCENT).setTitle(t(locale, 'dog.title')).setImage(url)],
    });
  } catch {
    await interaction.editReply({ content: t(locale, 'dog.fail') });
  }
}
