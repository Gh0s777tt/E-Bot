// /marry — system małżeństw: oświadczyny (przyciski Tak/Nie), status, rozwód.
// customId: marry:yes:<a>:<b> / marry:no:<a>:<b> — odpowiedzieć może tylko adresat(ka).
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveGuildLocale, resolveLocale, t } from '../i18n/index.mts';
import { clearMarriage, getMarriage, setMarriage } from '../lib/marriage.mts';

const ACCENT = 0xe50914;
const PINK = 0xf47fff;

export const data = new SlashCommandBuilder()
  .setName('marry')
  .setDescription('Małżeństwa na serwerze. 💍')
  .addSubcommand((s) =>
    s
      .setName('oswiadczyny')
      .setDescription('Oświadcz się komuś! 💍')
      .addUserOption((o) =>
        o.setName('uzytkownik').setDescription('Wybranek/wybranka').setRequired(true),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('status')
      .setDescription('Sprawdź stan cywilny.')
      .addUserOption((o) => o.setName('uzytkownik').setDescription('Czyj (domyślnie Twój)')),
  )
  .addSubcommand((s) => s.setName('rozwod').setDescription('Zakończ związek. 💔'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({
      content: t(locale, 'sticky.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const sub = interaction.options.getSubcommand(true);

  if (sub === 'oswiadczyny') {
    const target = interaction.options.getUser('uzytkownik', true);
    const me = interaction.user;
    if (target.id === me.id || target.bot) {
      await interaction.reply({
        content: t(locale, 'marry.selfOrBot'),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (getMarriage(guildId, me.id)) {
      await interaction.reply({
        content: t(locale, 'marry.alreadyYou'),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (getMarriage(guildId, target.id)) {
      await interaction.reply({
        content: t(locale, 'marry.alreadyTarget', { b: `<@${target.id}>` }),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const gLocale = resolveGuildLocale();
    const embed = new EmbedBuilder()
      .setColor(PINK)
      .setDescription(t(gLocale, 'marry.proposal', { a: `<@${me.id}>`, b: `<@${target.id}>` }));
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`marry:yes:${me.id}:${target.id}`)
        .setLabel(t(gLocale, 'marry.btnYes'))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`marry:no:${me.id}:${target.id}`)
        .setLabel(t(gLocale, 'marry.btnNo'))
        .setStyle(ButtonStyle.Danger),
    );
    await interaction.reply({ content: `<@${target.id}>`, embeds: [embed], components: [row] });
    return;
  }

  if (sub === 'status') {
    const user = interaction.options.getUser('uzytkownik') ?? interaction.user;
    const m = getMarriage(guildId, user.id);
    if (!m) {
      await interaction.reply({
        content: t(locale, 'marry.statusSingle', { user: `<@${user.id}>` }),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await interaction.reply({
      content: t(locale, 'marry.statusMarried', {
        a: `<@${user.id}>`,
        b: `<@${m.partner}>`,
        since: `<t:${Math.floor(m.since / 1000)}:D>`,
      }),
    });
    return;
  }

  // rozwod
  const removed = clearMarriage(guildId, interaction.user.id);
  await interaction.reply({
    content: t(locale, removed ? 'marry.divorced' : 'marry.notMarried'),
    flags: MessageFlags.Ephemeral,
  });
}

// Przyciski oświadczyn — klika tylko adresat(ka); re-walidacja stanu przy kliknięciu.
export async function handleMarryButton(interaction: ButtonInteraction): Promise<void> {
  const [, answer, a, b] = interaction.customId.split(':');
  const locale = resolveLocale(interaction);
  const guildId = interaction.guildId;
  if (!guildId || !answer || !a || !b) return;

  if (interaction.user.id !== b) {
    await interaction.reply({
      content: t(locale, 'marry.notForYou'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const gLocale = resolveGuildLocale();
  if (answer === 'no') {
    await interaction.update({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(ACCENT)
          .setDescription(t(gLocale, 'marry.declined', { a: `<@${a}>`, b: `<@${b}>` })),
      ],
      components: [],
    });
    return;
  }

  // yes — sprawdź, czy żadna ze stron nie weszła w związek w międzyczasie
  if (getMarriage(guildId, a) || getMarriage(guildId, b)) {
    await interaction.update({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(ACCENT)
          .setDescription(t(gLocale, 'marry.alreadyTarget', { b: `<@${a}>` })),
      ],
      components: [],
    });
    return;
  }
  setMarriage(guildId, a, b);
  await interaction.update({
    content: '',
    embeds: [
      new EmbedBuilder()
        .setColor(PINK)
        .setDescription(t(gLocale, 'marry.married', { a: `<@${a}>`, b: `<@${b}>` })),
    ],
    components: [],
  });
}
