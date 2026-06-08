// /confess — anonimowe wyznanie publikowane na bieżącym kanale (autor ukryty, ack ephemeralny).
// Zabezpieczenie: odrzuca treści ze scam-linkami i danymi osobowymi (karta/PESEL/dowód/IBAN).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { findPII, type PiiOpts, piiLabel, scanScam } from '../lib/contentScan.mts';

const ACCENT = 0xe50914;
const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });
const PII: PiiOpts = { creditCard: true, pesel: true, idCard: true, iban: true };

export const data = new SlashCommandBuilder()
  .setName('confess')
  .setDescription('Wyślij anonimowe wyznanie na tym kanale.')
  .addStringOption((o) =>
    o
      .setName('tresc')
      .setDescription('Treść wyznania (anonimowo, do 1000 znaków)')
      .setRequired(true)
      .setMaxLength(1000),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const text = interaction.options.getString('tresc', true);
  const ch = interaction.channel;
  if (!ch || !('send' in ch)) {
    await interaction.reply(eph('Tu nie można wysłać wyznania.'));
    return;
  }
  if (scanScam(text)) {
    await interaction.reply(eph('🚫 Wyznanie zawiera podejrzany link — odrzucone.'));
    return;
  }
  const pii = findPII(text, PII);
  if (pii.length) {
    await interaction.reply(
      eph(`🚫 Wyznanie zawiera dane osobowe (${pii.map(piiLabel).join(', ')}) — odrzucone.`),
    );
    return;
  }
  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle('🤫 Anonimowe wyznanie')
    .setDescription(text)
    .setFooter({ text: 'Napisz swoje: /confess' });
  await ch.send({ embeds: [embed] });
  await interaction.reply(eph('✅ Wysłano anonimowo.'));
}
