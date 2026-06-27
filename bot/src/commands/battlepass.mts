// /battlepass — sezonowy (miesięczny) battle-pass: postęp tierów wg aktywności (wiadomości w bieżącym
// miesiącu z user_activity). Tiery = KAMIENIE MILOWE (tytuły), nie przyznawane nagrody — gamifikacja
// aktywności bez nowego storage. Silnik battlePassTier czysty i testowalny.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';

export type Tier = { tier: number; need: number; title: string };

// Drabina kamieni milowych (próg = wiadomości w miesiącu). Rosnące progi; tytuły tematyczne.
export const TIERS: Tier[] = [
  { tier: 1, need: 10, title: '🌱 Rozgrzewka' },
  { tier: 2, need: 30, title: '🔥 Rozkręcasz się' },
  { tier: 3, need: 75, title: '⭐ Stały bywalec' },
  { tier: 4, need: 150, title: '💪 Aktywny' },
  { tier: 5, need: 300, title: '🚀 Napędowy' },
  { tier: 6, need: 600, title: '👑 Filar społeczności' },
  { tier: 7, need: 1000, title: '🏆 Weteran sezonu' },
  { tier: 8, need: 1500, title: '🌟 Legenda sezonu' },
];

// Czysty silnik: dla XP (aktywności) i drabiny tierów zwraca aktualny tier, następny, % postępu do
// niego i odblokowane. Brak następnego = maksymalny tier (100%). Testowalny (battlepass.test.ts).
export function battlePassTier(
  xp: number,
  tiers: Tier[],
): { current: number; next: Tier | null; progressPct: number; unlocked: Tier[] } {
  const sorted = [...tiers].sort((a, b) => a.need - b.need);
  const unlocked = sorted.filter((t) => xp >= t.need);
  const last = unlocked[unlocked.length - 1];
  const next = sorted.find((t) => xp < t.need) ?? null;
  const base = last?.need ?? 0;
  const progressPct = next
    ? Math.min(100, Math.max(0, Math.round(((xp - base) / (next.need - base)) * 100)))
    : 100;
  return { current: last?.tier ?? 0, next, progressPct, unlocked };
}

function bar(pct: number): string {
  const filled = Math.round(pct / 10);
  return '▰'.repeat(filled) + '▱'.repeat(10 - filled);
}

export const data = new SlashCommandBuilder()
  .setName('battlepass')
  .setDescription('Twój sezonowy battle-pass — postęp tierów wg aktywności w tym miesiącu.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Battle-pass wymaga chmury (Supabase).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.deferReply();
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const rows = await cloudSelect<{ messages?: number }>(
    'user_activity',
    `select=messages&guild_id=eq.${interaction.guildId}&user_id=eq.${interaction.user.id}&day=gte.${month}-01`,
  ).catch(() => [] as { messages?: number }[]);
  const xp = rows.reduce((a, r) => a + (r.messages ?? 0), 0);
  const { current, next, progressPct, unlocked } = battlePassTier(xp, TIERS);
  const curTitle = unlocked[unlocked.length - 1]?.title ?? '— jeszcze nic (napisz coś!)';

  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle(`🎟️ Battle-pass — sezon ${month}`)
    .setDescription(
      `**${interaction.user.username}** · ${xp.toLocaleString('pl-PL')} wiad. w tym miesiącu\n` +
        `Tier **${current}/${TIERS.length}** — ${curTitle}\n` +
        `${bar(progressPct)} ${progressPct}%\n` +
        (next
          ? `Do **Tier ${next.tier} (${next.title})**: jeszcze ${(next.need - xp).toLocaleString('pl-PL')} wiad.`
          : '🏆 Maksymalny tier sezonu osiągnięty!'),
    )
    .setFooter({ text: 'Tiery to kamienie milowe aktywności w bieżącym miesiącu.' });
  await interaction.editReply({ embeds: [embed] });
}
