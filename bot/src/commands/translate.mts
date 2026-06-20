// /translate — tłumaczenie tekstu przez AI (wspólne limity ai_usage).
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { aiConfig, bumpUsage, callModel, checkUsage } from '../lib/ai.mts';

export const data = new SlashCommandBuilder()
  .setName('translate')
  .setDescription('Przetłumacz tekst na wybrany język (AI).')
  .addStringOption((o) =>
    o.setName('tekst').setDescription('Tekst do tłumaczenia').setRequired(true).setMaxLength(1500),
  )
  .addStringOption((o) =>
    o
      .setName('jezyk')
      .setDescription('Język docelowy (np. angielski, polski, niemiecki)')
      .setRequired(true)
      .setMaxLength(40),
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
  await interaction.deferReply();

  const usage = await checkUsage(interaction.user.id, interaction.guildId ?? '', cfg);
  if (usage.limited) {
    await interaction.editReply(usage.limited);
    return;
  }

  const tekst = interaction.options.getString('tekst', true);
  const jezyk = interaction.options.getString('jezyk', true);

  try {
    const { text, tokens } = await callModel(
      cfg.model,
      [
        {
          role: 'system',
          content: `Jesteś tłumaczem. Przetłumacz tekst użytkownika na język: ${jezyk}. Zwróć WYŁĄCZNIE tłumaczenie, bez komentarzy i bez oryginału.`,
        },
        { role: 'user', content: tekst },
      ],
      800,
    );
    await bumpUsage(interaction.user.id, usage, tokens);
    await interaction.editReply(`🌐 **→ ${jezyk}:**\n${text}`.slice(0, 1900));
  } catch (e) {
    await interaction.editReply(`😵 Błąd AI: ${(e as Error).message}`);
  }
}
