// Interakcje społeczne (/hug /kiss /slap /pat) — anime-GIF z nekos.best (darmowe, bez klucza).
// Jedna fabryka zamiast 4 plików; eksporty nazwane trafiają wprost do tablicy commands.
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;
type Kind = 'hug' | 'kiss' | 'slap' | 'pat';

async function fetchGif(kind: Kind): Promise<string | undefined> {
  const r = await fetch(`https://nekos.best/api/v2/${kind}`, {
    signal: AbortSignal.timeout(8000),
  });
  const j = (await r.json()) as { results?: { url?: string }[] };
  return j.results?.[0]?.url;
}

function make(kind: Kind, desc: string) {
  const data = new SlashCommandBuilder()
    .setName(kind)
    .setDescription(desc)
    .addUserOption((o) => o.setName('uzytkownik').setDescription('Kogo?').setRequired(true));

  async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const locale = resolveLocale(interaction);
    const target = interaction.options.getUser('uzytkownik', true);
    await interaction.deferReply();
    try {
      const gif = await fetchGif(kind);
      if (!gif) throw new Error('no gif');
      const text =
        target.id === interaction.user.id
          ? t(locale, 'act.self')
          : t(locale, `act.${kind}`, { a: `<@${interaction.user.id}>`, b: `<@${target.id}>` });
      const embed = new EmbedBuilder().setColor(ACCENT).setDescription(text).setImage(gif);
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: t(locale, 'act.fail') });
    }
  }

  return { data, execute };
}

export const hug = make('hug', 'Przytul kogoś! 🤗');
export const kiss = make('kiss', 'Pocałuj kogoś! 😘');
export const slap = make('slap', 'Daj komuś z liścia! 👋');
export const pat = make('pat', 'Pogłaszcz kogoś po głowie! 🫳');
