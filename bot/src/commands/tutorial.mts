// /tutorial — interaktywny onboarding: 6 kroków przez przyciski (◀ Wstecz / Dalej ▶ / ✅ Zakończ).
// Efemeryczny, w 14 językach. Stan (numer kroku) zakodowany w customId 'tut:go:N'. Routing 'tut:' w index.mts.
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
import { type Locale, resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;
const STEPS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;
const TOTAL = STEPS.length;

function clamp(i: number): number {
  return Math.max(0, Math.min(TOTAL - 1, i));
}

function stepEmbed(locale: Locale, i: number): EmbedBuilder {
  const s = STEPS[i];
  return new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, `tut.${s}.title`))
    .setDescription(t(locale, `tut.${s}.body`))
    .setFooter({ text: t(locale, 'tut.step', { n: i + 1, total: TOTAL }) });
}

function stepRow(locale: Locale, i: number): ActionRowBuilder<ButtonBuilder> {
  const back = new ButtonBuilder()
    .setCustomId(`tut:go:${i - 1}`)
    .setLabel(t(locale, 'tut.back'))
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(i === 0);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(back);
  if (i < TOTAL - 1) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`tut:go:${i + 1}`)
        .setLabel(t(locale, 'tut.next'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('tut:close')
        .setLabel(t(locale, 'tut.close'))
        .setStyle(ButtonStyle.Secondary),
    );
  } else {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('tut:close')
        .setLabel(t(locale, 'tut.finish'))
        .setStyle(ButtonStyle.Success),
    );
  }
  return row;
}

export const data = new SlashCommandBuilder()
  .setName('tutorial')
  .setDescription('Interaktywny samouczek — poznaj bota krok po kroku.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  await interaction.reply({
    embeds: [stepEmbed(locale, 0)],
    components: [stepRow(locale, 0)],
    flags: MessageFlags.Ephemeral,
  });
}

// Routing z dispatchera (index.mts) dla przycisków o customId 'tut:*'.
export async function handleTutorialButton(interaction: ButtonInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const parts = interaction.customId.split(':'); // ['tut','go','N'] albo ['tut','close']
  if (parts[1] === 'close') {
    await interaction.update({ components: [] }); // zostaw aktualny embed, usuń przyciski
    return;
  }
  const i = clamp(Number(parts[2]) || 0);
  await interaction.update({ embeds: [stepEmbed(locale, i)], components: [stepRow(locale, i)] });
}
