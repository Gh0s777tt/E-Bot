// /poll — natywna ankieta Discord (głosowanie + wyniki + auto-timer po stronie Discorda).
// Opcja `reakcje:true` = stary tryb (embed + reakcje 1️⃣–🔟 / 👍👎), na wypadek braku ankiet.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveGuildLocale, resolveLocale, t } from '../i18n/index.mts';

const NUM = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Utwórz ankietę (natywna ankieta Discord z timerem).')
  .addStringOption((o) =>
    o.setName('pytanie').setDescription('Treść pytania').setRequired(true).setMaxLength(300),
  )
  .addStringOption((o) =>
    o
      .setName('opcje')
      .setDescription('Opcje oddzielone | (2–10). Puste = tak/nie.')
      .setMaxLength(1000),
  )
  .addIntegerOption((o) =>
    o
      .setName('czas')
      .setDescription('Czas trwania ankiety (domyślnie 1 dzień)')
      .addChoices(
        { name: '1 godzina', value: 1 },
        { name: '4 godziny', value: 4 },
        { name: '12 godzin', value: 12 },
        { name: '1 dzień', value: 24 },
        { name: '3 dni', value: 72 },
        { name: '7 dni', value: 168 },
      ),
  )
  .addBooleanOption((o) =>
    o.setName('wielokrotny').setDescription('Pozwól wybrać kilka odpowiedzi'),
  )
  .addBooleanOption((o) =>
    o.setName('reakcje').setDescription('Stary tryb: embed + reakcje zamiast natywnej ankiety'),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const q = interaction.options.getString('pytanie', true);
  const opts = (interaction.options.getString('opcje') ?? '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
  const hours = interaction.options.getInteger('czas') ?? 24;
  const multi = interaction.options.getBoolean('wielokrotny') ?? false;
  const legacy = interaction.options.getBoolean('reakcje') ?? false;

  const ch = interaction.channel;
  if (!ch || !('send' in ch)) {
    await interaction.reply({
      content: t(locale, 'poll.cantCreate'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // ── Stary tryb: embed + reakcje ───────────────────────────────────────────
  if (legacy) {
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
    await interaction.reply({ embeds: [embed] });
    const msg = await interaction.fetchReply();
    for (const e of emojis) await msg.react(e).catch(() => {});
    return;
  }

  // ── Natywna ankieta Discord (Polls v2) ────────────────────────────────────
  const gLocale = resolveGuildLocale();
  const answers =
    opts.length >= 2
      ? opts.map((text, i) => ({ text: text.slice(0, 55), emoji: NUM[i] }))
      : [
          { text: t(gLocale, 'poll.yes'), emoji: '👍' },
          { text: t(gLocale, 'poll.no'), emoji: '👎' },
        ];

  try {
    await ch.send({
      poll: {
        question: { text: q.slice(0, 300) },
        answers,
        duration: hours,
        allowMultiselect: multi,
      },
    });
    await interaction.reply({
      content: t(locale, 'poll.created'),
      flags: MessageFlags.Ephemeral,
    });
  } catch {
    await interaction.reply({
      content: t(locale, 'poll.cantCreate'),
      flags: MessageFlags.Ephemeral,
    });
  }
}
