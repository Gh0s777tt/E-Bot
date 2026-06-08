import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Sprawdza, czy bot żyje (latencja).');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const before = Date.now();
  await interaction.reply({ content: t(locale, 'ping.alive') });
  const ws = Math.round(interaction.client.ws.ping);
  await interaction.editReply(
    `${t(locale, 'ping.alive')} · API: ${Date.now() - before} ms · WS: ${ws < 0 ? '—' : `${ws} ms`}`,
  );
}
