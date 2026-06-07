// /hof — Hall of Fame zakończonych sezonów levelingu (z 'xp_hall_of_fame', zapis przez analytics/seasons.mts).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';

type HofRow = { user_id: string; xp: number; level: number; rank: number };
const MEDAL = ['🥇', '🥈', '🥉'];

export const data = new SlashCommandBuilder()
  .setName('hof')
  .setDescription('Hall of Fame sezonów levelingu.')
  .addStringOption((o) =>
    o
      .setName('miesiac')
      .setDescription('Sezon w formacie RRRR-MM (domyślnie ostatni)')
      .setMaxLength(7),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Hall of Fame wymaga chmury (Supabase + _ALL.sql).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  let month = interaction.options.getString('miesiac')?.trim();
  if (!month) {
    const latest = await cloudSelect<{ month: string }>(
      'xp_hall_of_fame',
      `select=month&guild_id=eq.${interaction.guildId}&order=month.desc&limit=1`,
    );
    month = latest[0]?.month;
  }
  if (!month) {
    await interaction.reply({
      content: 'Brak zarchiwizowanych sezonów (pojawią się po pierwszym przełomie miesiąca).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const rows = await cloudSelect<HofRow>(
    'xp_hall_of_fame',
    `select=user_id,xp,level,rank&guild_id=eq.${interaction.guildId}&month=eq.${encodeURIComponent(month)}&order=rank.asc&limit=25`,
  );
  if (!rows.length) {
    await interaction.reply({
      content: `Brak danych dla sezonu ${month}.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle(`🏆 Hall of Fame — sezon ${month}`)
    .setDescription(
      rows
        .map(
          (r) =>
            `${MEDAL[r.rank - 1] ?? `**${r.rank}.**`} <@${r.user_id}> — lvl ${r.level} · ${r.xp.toLocaleString('pl-PL')} XP`,
        )
        .join('\n'),
    );
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
