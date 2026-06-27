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

type ModCase = { username?: string; action?: string; reason?: string; created_at?: string };

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

// Buduje kontekst „kolejki serwera" dla AI z ostatnich spraw CAŁEGO serwera (czysta, testowalna).
// Pusta → spokój. Przycina do 25 najnowszych w treści; nagłówek niesie pełną liczbę.
export function buildQueuePrompt(cases: ModCase[]): string {
  if (!cases.length) return 'Brak spraw moderacyjnych w ostatnim czasie — spokojnie na serwerze.';
  const lines = cases
    .slice(0, 25)
    .map(
      (c, i) =>
        `${i + 1}. [${(c.created_at ?? '').slice(0, 10)}] ${c.username ?? '?'} — ${c.action ?? '?'}${c.reason ? ` (${c.reason})` : ''}`,
    )
    .join('\n');
  return `Ostatnie sprawy moderacyjne serwera (${cases.length}):\n${lines}`;
}

export const data = new SlashCommandBuilder()
  .setName('modai')
  .setDescription('AI co-pilot moderacji: analiza użytkownika lub kolejki serwera.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addSubcommand((s) =>
    s
      .setName('user')
      .setDescription('Analiza historii użytkownika + sugestia akcji')
      .addUserOption((o) =>
        o.setName('uzytkownik').setDescription('Kogo przeanalizować').setRequired(true),
      ),
  )
  .addSubcommand((s) =>
    s.setName('queue').setDescription('Streszczenie ostatniej aktywności moderacyjnej serwera'),
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
  const sub = interaction.options.getSubcommand();
  let system: string;
  let userContent: string;
  let title: string;
  if (sub === 'queue') {
    const cases = await cloudSelect<ModCase>(
      'mod_cases',
      `select=username,action,reason,created_at&guild_id=eq.${interaction.guildId}&order=created_at.desc&limit=25`,
    ).catch(() => [] as ModCase[]);
    system =
      'Jesteś asystentem moderatora Discord. Na podstawie ostatnich spraw moderacyjnych serwera: 1) streść, co się działo (powtarzające się powody/użytkownicy, wzorce), 2) wskaż, co wymaga uwagi (eskalacja, możliwa skoordynowana akcja, recydywa), 3) podaj 1-3 rekomendacje. Po polsku, zwięźle. To REKOMENDACJA — decyzję podejmuje moderator.';
    userContent = buildQueuePrompt(cases);
    title = 'Co-pilot moderacji — kolejka serwera';
  } else {
    const target = interaction.options.getUser('uzytkownik', true);
    const cases = await cloudSelect<ModCase>(
      'mod_cases',
      `select=action,reason,created_at&guild_id=eq.${interaction.guildId}&user_id=eq.${target.id}&order=created_at.desc&limit=20`,
    ).catch(() => [] as ModCase[]);
    system =
      'Jesteś asystentem moderatora Discord. Na podstawie historii spraw użytkownika: 1) streść jego zachowanie w 2-3 zdaniach, 2) zasugeruj akcję (brak / ostrzeżenie / timeout / kick / ban) z krótkim uzasadnieniem, 3) zaproponuj zwięzłą, uprzejmą wiadomość do użytkownika. Po polsku, rzeczowo. To wyłącznie REKOMENDACJA — ostateczną decyzję podejmuje moderator.';
    userContent = buildModPrompt(cases, target.username);
    title = `Co-pilot moderacji — ${target.username}`;
  }
  try {
    const { text, tokens } = await callModel(
      cfg.model,
      [
        { role: 'system', content: system },
        { role: 'user', content: userContent },
      ],
      700,
    );
    await bumpUsage(interaction.user.id, usage, tokens);
    await interaction.editReply(
      `🤖 **${title}** _(rekomendacja AI)_\n${text.slice(0, 1850) || '—'}`,
    );
  } catch (e) {
    await interaction.editReply(`😵 Błąd AI: ${(e as Error).message}`);
  }
}
