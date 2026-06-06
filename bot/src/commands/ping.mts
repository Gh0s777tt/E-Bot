import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Sprawdza, czy bot żyje (latencja).');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const before = Date.now();
  await interaction.reply({ content: 'Pong! 🏓' });
  const ws = Math.round(interaction.client.ws.ping);
  await interaction.editReply(`Pong! 🏓 · API: ${Date.now() - before} ms · WS: ${ws < 0 ? '—' : ws + ' ms'}`);
}
