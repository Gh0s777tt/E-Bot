// Faza 8 — /rewrite: przepisz tekst w wybranym stylu (AI). Wspólne limity ai_usage.
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { aiConfig, bumpUsage, callModel, checkUsage } from '../lib/ai.mts';

export const data = new SlashCommandBuilder()
  .setName('rewrite')
  .setDescription('Przepisz tekst w wybranym stylu (AI).')
  .addStringOption((o) =>
    o.setName('tekst').setDescription('Tekst do przepisania').setRequired(true).setMaxLength(1500),
  )
  .addStringOption((o) =>
    o
      .setName('styl')
      .setDescription('Docelowy styl')
      .setRequired(true)
      .addChoices(
        { name: 'Formalny / profesjonalny', value: 'formalny, profesjonalny' },
        { name: 'Luźny / swobodny', value: 'luźny, swobodny, przyjazny' },
        { name: 'Krótszy / zwięzły', value: 'maksymalnie zwięzły, bez lania wody' },
        { name: 'Poprawny językowo', value: 'poprawiony językowo i gramatycznie, zachowując sens' },
        { name: 'Bardziej uprzejmy', value: 'bardziej uprzejmy i taktowny' },
      ),
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
  const usage = await checkUsage(interaction.user.id, cfg);
  if (usage.limited) {
    await interaction.editReply(usage.limited);
    return;
  }
  const tekst = interaction.options.getString('tekst', true);
  const styl = interaction.options.getString('styl', true);
  try {
    const { text, tokens } = await callModel(
      cfg.model,
      [
        {
          role: 'system',
          content: `Przepisz tekst użytkownika w stylu: ${styl}. Zwróć WYŁĄCZNIE przepisany tekst, po polsku, bez komentarzy.`,
        },
        { role: 'user', content: tekst },
      ],
      900,
    );
    await bumpUsage(interaction.user.id, usage, tokens);
    await interaction.editReply(`✍️ **Przepisane (${styl}):**\n${text}`.slice(0, 1900));
  } catch (e) {
    await interaction.editReply(`😵 Błąd AI: ${(e as Error).message}`);
  }
}
