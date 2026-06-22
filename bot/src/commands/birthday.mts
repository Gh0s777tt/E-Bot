// /birthday — ustaw/usuń swoje urodziny (ogłaszane przez poller z community/birthdays.mts).

import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { cloudDelete, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';

const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Walidacja daty urodzin (BEZ roku → luty dopuszcza 29): miesiąc 1–12, dzień 1–liczba dni miesiąca.
// Odrzuca dni spoza miesiąca (30 lutego, 31 kwietnia/czerwca/września/listopada). Regresja = przyjęcie
// nieistniejącej daty → poller urodzinowy nigdy nie ogłosi (albo ogłosi w złym dniu).
export function isValidBirthday(day: number, month: number): boolean {
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= MONTH_DAYS[month - 1];
}

export const data = new SlashCommandBuilder()
  .setName('birthday')
  .setDescription('Twoje urodziny na serwerze.')
  .addSubcommand((s) =>
    s
      .setName('set')
      .setDescription('Ustaw datę urodzin')
      .addIntegerOption((o) =>
        o
          .setName('dzien')
          .setDescription('Dzień (1–31)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(31),
      )
      .addIntegerOption((o) =>
        o
          .setName('miesiac')
          .setDescription('Miesiąc (1–12)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(12),
      ),
  )
  .addSubcommand((s) => s.setName('clear').setDescription('Usuń swoje urodziny'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply({
      content: t(locale, 'error.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: t(locale, 'birthday.needCloud'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.options.getSubcommand() === 'clear') {
    await cloudDelete(
      'birthdays',
      `guild_id=eq.${interaction.guildId}&user_id=eq.${interaction.user.id}`,
    ).catch(() => {});
    await interaction.reply({
      content: t(locale, 'birthday.cleared'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const day = interaction.options.getInteger('dzien', true);
  const month = interaction.options.getInteger('miesiac', true);
  if (!isValidBirthday(day, month)) {
    await interaction.reply({
      content: t(locale, 'birthday.badDay'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await cloudUpsert(
    'birthdays',
    [
      {
        guild_id: interaction.guildId,
        user_id: interaction.user.id,
        username: interaction.user.username,
        day,
        month,
      },
    ],
    'guild_id,user_id',
  ).catch((e) => log.warn('[birthday]', { err: e }));
  await interaction.reply({
    content: t(locale, 'birthday.saved', { day, month }),
    flags: MessageFlags.Ephemeral,
  });
}
