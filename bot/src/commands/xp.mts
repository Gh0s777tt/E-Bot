// Faza 8 — /xp: narzędzie admina do zarządzania XP użytkownika (give/remove/set/reset).
// Pisze do tabeli 'user_levels' (jak leveling.mts); poziom przeliczany tą samą formułą.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { levelForXp } from '../leveling.mts';
import { cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';

const userOpt = (s: import('discord.js').SlashCommandSubcommandBuilder) =>
  s.addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true));
const amountOpt = (s: import('discord.js').SlashCommandSubcommandBuilder) =>
  s.addIntegerOption((o) =>
    o
      .setName('ile')
      .setDescription('Ilość XP')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(10_000_000),
  );

export const data = new SlashCommandBuilder()
  .setName('xp')
  .setDescription('Zarządzaj XP użytkownika (admin).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((s) => amountOpt(userOpt(s.setName('give').setDescription('Dodaj XP'))))
  .addSubcommand((s) => amountOpt(userOpt(s.setName('remove').setDescription('Odejmij XP'))))
  .addSubcommand((s) => amountOpt(userOpt(s.setName('set').setDescription('Ustaw XP na wartość'))))
  .addSubcommand((s) => userOpt(s.setName('reset').setDescription('Wyzeruj XP i poziom')));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId || !hasCloud()) {
    await interaction.reply({
      content: '⚠️ Leveling/chmura niedostępne.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const sub = interaction.options.getSubcommand();
  const user = interaction.options.getUser('user', true);
  const amount = sub === 'reset' ? 0 : (interaction.options.getInteger('ile', true) ?? 0);

  try {
    const rows = await cloudSelect<{ xp: number }>(
      'user_levels',
      `select=xp&guild_id=eq.${interaction.guildId}&user_id=eq.${encodeURIComponent(user.id)}`,
    );
    const curXp = rows[0]?.xp ?? 0;
    let newXp = curXp;
    if (sub === 'give') newXp = curXp + amount;
    else if (sub === 'remove') newXp = Math.max(0, curXp - amount);
    else if (sub === 'set') newXp = Math.max(0, amount);
    else newXp = 0;
    const newLevel = levelForXp(newXp);

    await cloudUpsert(
      'user_levels',
      [
        {
          guild_id: interaction.guildId,
          user_id: user.id,
          username: user.username,
          xp: newXp,
          level: newLevel,
        },
      ],
      'guild_id,user_id',
    );
    await interaction.reply({
      content: `✅ <@${user.id}> → XP: **${newXp.toLocaleString('pl-PL')}** (poziom **${newLevel}**).`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (e) {
    await interaction.reply({
      content: `❌ Nie udało się: ${(e as Error).message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
