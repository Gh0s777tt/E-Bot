// Tor A2 — /quests: podgląd questów dziennych/tygodniowych + odbiór nagród (przycisk).
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { buildQuestsView } from '../community/quests.mts';
import { hasCloud } from '../lib/cloud.mts';

export const data = new SlashCommandBuilder()
  .setName('quests')
  .setDescription('Twoje questy dzienne i tygodniowe + odbiór nagród.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Questy wymagają chmury (Supabase).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const view = await buildQuestsView(
    interaction.guildId,
    interaction.user.id,
    interaction.user.username,
  );
  await interaction.reply(view);
}
