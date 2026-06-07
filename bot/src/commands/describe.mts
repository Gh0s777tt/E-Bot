// Tor C — /describe: AI opisuje załączony obrazek (vision, OpenAI). Pod wspólnym limitem AI.
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { aiConfig, bumpUsage, checkUsage, describeImage } from '../lib/ai.mts';

export const data = new SlashCommandBuilder()
  .setName('describe')
  .setDescription('AI opisze załączony obrazek.')
  .addAttachmentOption((o) =>
    o.setName('obraz').setDescription('Obrazek do opisania').setRequired(true),
  )
  .addStringOption((o) =>
    o.setName('pytanie').setDescription('O co zapytać (opcjonalnie)').setMaxLength(300),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cfg = aiConfig();
  if (!cfg.enabled) {
    await interaction.reply({
      content: '🤖 Komendy AI są wyłączone.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const att = interaction.options.getAttachment('obraz', true);
  if (!att.contentType?.startsWith('image/')) {
    await interaction.reply({ content: '❌ To nie jest obrazek.', flags: MessageFlags.Ephemeral });
    return;
  }
  await interaction.deferReply();
  const usage = await checkUsage(interaction.user.id, cfg);
  if (usage.limited) {
    await interaction.editReply(usage.limited);
    return;
  }
  try {
    const prompt =
      interaction.options.getString('pytanie') || 'Opisz dokładnie ten obrazek po polsku.';
    const { text, tokens } = await describeImage(att.url, prompt);
    await bumpUsage(interaction.user.id, usage, tokens);
    await interaction.editReply((text || '(brak odpowiedzi)').slice(0, 1900));
  } catch (e) {
    await interaction.editReply(`😵 Błąd analizy obrazu: ${(e as Error).message}`);
  }
}
