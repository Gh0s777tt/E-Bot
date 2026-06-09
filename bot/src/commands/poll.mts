// /poll — szybka ankieta: embed + reakcje (1️⃣–🔟 dla opcji, albo 👍/👎 bez opcji). Bez zapisu.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const NUM = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Utwórz ankietę z głosowaniem reakcjami.')
  .addStringOption((o) =>
    o.setName('pytanie').setDescription('Treść pytania').setRequired(true).setMaxLength(256),
  )
  .addStringOption((o) =>
    o
      .setName('opcje')
      .setDescription('Opcje oddzielone | (2–10). Puste = tak/nie.')
      .setMaxLength(1000),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const q = interaction.options.getString('pytanie', true);
  const opts = (interaction.options.getString('opcje') ?? '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);

  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle(`📊 ${q}`)
    .setFooter({ text: t(locale, 'poll.footer', { username: interaction.user.username }) })
    .setTimestamp(new Date());

  let emojis: string[];
  if (opts.length >= 2) {
    embed.setDescription(opts.map((o, i) => `${NUM[i]} ${o}`).join('\n'));
    emojis = opts.map((_, i) => NUM[i]);
  } else {
    embed.setDescription(t(locale, 'poll.yesNo'));
    emojis = ['👍', '👎'];
  }

  const ch = interaction.channel;
  if (!ch || !('send' in ch)) {
    await interaction.reply({
      content: t(locale, 'poll.cantCreate'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.reply({ embeds: [embed] });
  const msg = await interaction.fetchReply();
  for (const e of emojis) await msg.react(e).catch(() => {});
}
