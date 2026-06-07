// Tor 3 — /invites: statystyki zaproszeń (stats) + ranking (top). Dane z Supabase 'invites'.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';

const ACCENT = 0xe50914;

export const data = new SlashCommandBuilder()
  .setName('invites')
  .setDescription('Statystyki zaproszeń na serwerze.')
  .addSubcommand((s) =>
    s
      .setName('stats')
      .setDescription('Zaproszenia użytkownika')
      .addUserOption((o) =>
        o.setName('uzytkownik').setDescription('Czyje statystyki (domyślnie Twoje)'),
      ),
  )
  .addSubcommand((s) => s.setName('top').setDescription('Ranking zapraszających'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Śledzenie zaproszeń wymaga chmury (Supabase + _ALL.sql).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.options.getSubcommand() === 'stats') {
    const user = interaction.options.getUser('uzytkownik') ?? interaction.user;
    const rows = await cloudSelect<{ fake: boolean; has_left: boolean }>(
      'invites',
      `select=fake,has_left&guild_id=eq.${interaction.guildId}&inviter_id=eq.${user.id}`,
    ).catch(() => [] as { fake: boolean; has_left: boolean }[]);
    const total = rows.length;
    const fake = rows.filter((r) => r.fake).length;
    const left = rows.filter((r) => r.has_left).length;
    const real = total - fake - left;
    const e = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle(`📨 Zaproszenia — ${user.username}`)
      .setDescription(`**${Math.max(0, real)}** realnych zaproszeń`)
      .addFields(
        { name: 'Razem', value: String(total), inline: true },
        { name: 'Wyszli', value: String(left), inline: true },
        { name: 'Fejkowe', value: String(fake), inline: true },
      );
    await interaction.reply({ embeds: [e] });
    return;
  }

  // top
  const rows = await cloudSelect<{ inviter_id: string }>(
    'invites',
    `select=inviter_id&guild_id=eq.${interaction.guildId}&fake=eq.false&has_left=eq.false`,
  ).catch(() => [] as { inviter_id: string }[]);
  const counts = new Map<string, number>();
  for (const r of rows)
    if (r.inviter_id) counts.set(r.inviter_id, (counts.get(r.inviter_id) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const e = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle('🏆 Top zapraszający')
    .setDescription(
      top.length
        ? top.map(([id, n], i) => `**${i + 1}.** <@${id}> — ${n}`).join('\n')
        : 'Brak danych jeszcze.',
    );
  await interaction.reply({ embeds: [e] });
}
