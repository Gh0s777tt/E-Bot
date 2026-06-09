// /dadjoke — losowy suchar z icanhazdadjoke.com (darmowe, bez klucza). Graceful fail.
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;

export const data = new SlashCommandBuilder()
  .setName('dadjoke')
  .setDescription('Losowy suchar (żart) — po angielsku.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  await interaction.deferReply();
  try {
    const r = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'E-BOT Discord bot (https://github.com)',
      },
      signal: AbortSignal.timeout(8000),
    });
    const j = (await r.json()) as { joke?: string };
    if (!r.ok || !j.joke) throw new Error('no joke');
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(ACCENT)
          .setTitle(t(locale, 'dadjoke.title'))
          .setDescription(j.joke),
      ],
    });
  } catch {
    await interaction.editReply({ content: t(locale, 'dadjoke.fail') });
  }
}
