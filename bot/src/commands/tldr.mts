// /tldr — podsumowanie ostatnich wiadomości kanału przez AI (wspólne limity ai_usage).
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { aiConfig, bumpUsage, callModel, checkUsage } from '../lib/ai.mts';

export const data = new SlashCommandBuilder()
  .setName('tldr')
  .setDescription('Podsumuj ostatnie wiadomości na tym kanale (AI).')
  .addIntegerOption((o) =>
    o
      .setName('ile')
      .setDescription('Ile ostatnich wiadomości (10–100, domyślnie 40)')
      .setMinValue(10)
      .setMaxValue(100),
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
  const ch = interaction.channel;
  if (!ch || !('messages' in ch)) {
    await interaction.reply({ content: 'Tu nie można podsumować.', flags: MessageFlags.Ephemeral });
    return;
  }
  await interaction.deferReply();

  const usage = await checkUsage(interaction.user.id, interaction.guildId ?? '', cfg);
  if (usage.limited) {
    await interaction.editReply(usage.limited);
    return;
  }

  const n = interaction.options.getInteger('ile') ?? 40;
  const fetched = await (ch as TextChannel).messages.fetch({ limit: n }).catch(() => null);
  const lines = fetched
    ? [...fetched.values()]
        .reverse()
        .filter((m) => !m.author.bot && m.content)
        .map((m) => `${m.author.username}: ${m.content}`)
        .join('\n')
        .slice(0, 6000)
    : '';
  if (!lines) {
    await interaction.editReply('Brak treści tekstowej do podsumowania.');
    return;
  }

  try {
    const { text, tokens } = await callModel(
      cfg.model,
      [
        {
          role: 'system',
          content:
            'Jesteś pomocnym asystentem. Podsumuj zwięźle po polsku poniższą rozmowę z Discorda w 3–6 punktach. Pomiń spam i powitania.',
        },
        { role: 'user', content: lines },
      ],
      500,
    );
    await bumpUsage(interaction.user.id, usage, tokens);
    await interaction.editReply(`📝 **TL;DR ostatnich ${n} wiadomości:**\n${text}`.slice(0, 1900));
  } catch (e) {
    await interaction.editReply(`😵 Błąd AI: ${(e as Error).message}`);
  }
}
