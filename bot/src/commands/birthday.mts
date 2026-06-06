// /birthday — ustaw/usuń swoje urodziny (ogłaszane przez poller z community/birthdays.mts).
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { cloudDelete, cloudUpsert, hasCloud } from '../lib/cloud.mts';

const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

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
  if (!interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Urodziny wymagają chmury (Supabase + _ALL.sql).',
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
      content: '🗑️ Usunięto Twoje urodziny.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const day = interaction.options.getInteger('dzien', true);
  const month = interaction.options.getInteger('miesiac', true);
  if (day > MONTH_DAYS[month - 1]) {
    await interaction.reply({
      content: '❌ Ten miesiąc nie ma tylu dni.',
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
  ).catch((e) => console.warn('[birthday]', (e as Error).message));
  await interaction.reply({
    content: `🎂 Zapisano urodziny: **${day}.${month}**.`,
    flags: MessageFlags.Ephemeral,
  });
}
