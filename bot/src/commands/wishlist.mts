// /wishlist — lista życzeń gier (czyta Supabase 'wishlist'; dodawanie z panelu web).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';

export const data = new SlashCommandBuilder()
  .setName('wishlist')
  .setDescription('Lista życzeń gier (z panelu).');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Lista życzeń wymaga chmury (Supabase).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const rows = await cloudSelect<{
    title: string;
    store: string | null;
    release_year: number | null;
  }>('wishlist', 'select=title,store,release_year&order=created_at.desc&limit=25');
  if (!rows.length) {
    await interaction.reply({
      content: '🎮 Lista życzeń jest pusta. Dodaj gry w panelu web → Lista życzeń.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const desc = rows
    .map(
      (r, i) =>
        `${i + 1}. **${r.title}**${r.release_year ? ` (${r.release_year})` : ''}${r.store ? ` · ${r.store}` : ''}`,
    )
    .join('\n');
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('🎮 Lista życzeń')
    .setDescription(desc.slice(0, 4000));
  await interaction.reply({ embeds: [embed] });
}
