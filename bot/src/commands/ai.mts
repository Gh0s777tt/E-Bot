// /ai — zapytanie do modelu (DeepSeek/OpenAI) z TWARDYM dziennym limitem kosztów per użytkownik.
// Config z panelu (settings 'ai_config'), zużycie w tabeli Supabase 'ai_usage'. Wspólna warstwa: lib/ai.mts.
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { aiConfig, bumpUsage, callModel, checkUsage } from '../lib/ai.mts';

export const data = new SlashCommandBuilder()
  .setName('ai')
  .setDescription('Zapytaj AI (z dziennym limitem).')
  .addStringOption((o) =>
    o.setName('prompt').setDescription('Twoje pytanie do AI').setRequired(true).setMaxLength(1000),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cfg = aiConfig();
  if (!cfg.enabled) {
    await interaction.reply({
      content: '🤖 Komendy AI są wyłączone (włącz w panelu).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const prompt = interaction.options.getString('prompt', true);
  await interaction.deferReply();

  const usage = await checkUsage(interaction.user.id, cfg);
  if (usage.limited) {
    await interaction.editReply(usage.limited);
    return;
  }

  try {
    const { text, tokens } = await callModel(cfg.model, [{ role: 'user', content: prompt }]);
    await bumpUsage(interaction.user.id, usage, tokens);
    await interaction.editReply((text || '(brak odpowiedzi)').slice(0, 1900));
  } catch (e) {
    await interaction.editReply(`😵 Błąd AI: ${(e as Error).message}`);
  }
}
