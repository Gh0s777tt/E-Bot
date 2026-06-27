// /modai — AI co-pilot moderacji: streszcza historię spraw użytkownika, sugeruje akcję i draftuje
// odpowiedź. Mod-only (ManageMessages), ephemeral. Wspólne limity ai_usage (jak /ask). Prompt budowany
// czystą buildModPrompt (testowalna). To REKOMENDACJA — decyzję podejmuje moderator.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { aiConfig, bumpUsage, callModel, checkUsage } from '../lib/ai.mts';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';

type ModCase = { action?: string; reason?: string; created_at?: string };

// Buduje treść wiadomości „user" dla AI z historii spraw (czysta, testowalna). Pusta historia →
// jawna informacja (AI ma wtedy sugerować brak akcji). Przycina do 20 najnowszych w treści.
export function buildModPrompt(cases: ModCase[], username: string): string {
  if (!cases.length)
    return `Użytkownik „${username}" nie ma żadnych spraw moderacyjnych — historia czysta.`;
  const lines = cases
    .slice(0, 20)
    .map(
      (c, i) =>
        `${i + 1}. [${(c.created_at ?? '').slice(0, 10)}] ${c.action ?? '?'}${c.reason ? ` — ${c.reason}` : ''}`,
    )
    .join('\n');
  return `Historia moderacyjna użytkownika „${username}" (${cases.length} spraw, najnowsze pierwsze):\n${lines}`;
}

export const data = new SlashCommandBuilder()
  .setName('modai')
  .setDescription('AI co-pilot moderacji: streszczenie historii + sugestia akcji.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addUserOption((o) =>
    o.setName('uzytkownik').setDescription('Kogo przeanalizować').setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    await interaction.reply({
      content: '⛔ Wymaga uprawnienia „Zarządzanie wiadomościami".',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const cfg = aiConfig();
  if (!cfg.enabled) {
    await interaction.reply({
      content: '🤖 Komendy AI są wyłączone (włącz w panelu).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Wymaga chmury (Supabase) do historii spraw.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const usage = await checkUsage(interaction.user.id, interaction.guildId, cfg);
  if (usage.limited) {
    await interaction.editReply(usage.limited);
    return;
  }
  const target = interaction.options.getUser('uzytkownik', true);
  const cases = await cloudSelect<ModCase>(
    'mod_cases',
    `select=action,reason,created_at&guild_id=eq.${interaction.guildId}&user_id=eq.${target.id}&order=created_at.desc&limit=20`,
  ).catch(() => [] as ModCase[]);

  const system =
    'Jesteś asystentem moderatora Discord. Na podstawie historii spraw użytkownika: 1) streść jego zachowanie w 2-3 zdaniach, 2) zasugeruj akcję (brak / ostrzeżenie / timeout / kick / ban) z krótkim uzasadnieniem, 3) zaproponuj zwięzłą, uprzejmą wiadomość do użytkownika. Odpowiadaj po polsku, rzeczowo. To wyłącznie REKOMENDACJA — ostateczną decyzję podejmuje moderator.';
  try {
    const { text, tokens } = await callModel(
      cfg.model,
      [
        { role: 'system', content: system },
        { role: 'user', content: buildModPrompt(cases, target.username) },
      ],
      700,
    );
    await bumpUsage(interaction.user.id, usage, tokens);
    await interaction.editReply(
      `🤖 **Co-pilot moderacji — ${target.username}** _(rekomendacja AI)_\n${text.slice(0, 1850) || '—'}`,
    );
  } catch (e) {
    await interaction.editReply(`😵 Błąd AI: ${(e as Error).message}`);
  }
}
