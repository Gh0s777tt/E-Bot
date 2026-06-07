// Tor N — /linktwitch: użytkownik łączy swój login Twitch z kontem Discord (do roli za sub).
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { cloudUpsert, hasCloud } from '../lib/cloud.mts';

export const data = new SlashCommandBuilder()
  .setName('linktwitch')
  .setDescription('Połącz swój login Twitch (rola za subskrypcję).')
  .addStringOption((o) =>
    o
      .setName('login')
      .setDescription('Twój login Twitch (z URL kanału)')
      .setRequired(true)
      .setMaxLength(50),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Wymaga chmury (Supabase).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const login = interaction.options
    .getString('login', true)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
  if (!login) {
    await interaction.reply({
      content: '❌ Nieprawidłowy login Twitch.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await cloudUpsert(
    'twitch_links',
    [{ discord_id: interaction.user.id, twitch_login: login }],
    'discord_id',
  ).catch(() => {});
  await interaction.reply({
    content: `✅ Połączono z Twitch: **${login}**. Rola za subskrypcję nada się automatycznie (gdy twórca włączy EventSub subów).`,
    flags: MessageFlags.Ephemeral,
  });
}
