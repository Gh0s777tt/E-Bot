// /case — historia spraw moderacyjnych (Supabase 'mod_cases'). Gate: ModerateMembers.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';

type Case = {
  id: string;
  user_id: string;
  username: string | null;
  moderator_name: string | null;
  action: string;
  reason: string | null;
  created_at: string;
};

const EMOJI: Record<string, string> = {
  warn: '⚠️',
  timeout: '🔇',
  clear: '🧹',
  note: '📝',
  kick: '👢',
  ban: '🔨',
  tempban: '⏳',
  unban: '♻️',
};

const SELECT = 'select=id,user_id,username,moderator_name,action,reason,created_at';

function fmt(d: string): string {
  return new Date(d).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
}

function line(c: Case): string {
  const mod = c.moderator_name ? ` · ${c.moderator_name}` : '';
  return `${EMOJI[c.action] ?? '•'} **${c.action}** \`#${c.id.slice(0, 8)}\` — ${c.reason || '(brak powodu)'}\n   ${fmt(c.created_at)}${mod}`;
}

export const data = new SlashCommandBuilder()
  .setName('case')
  .setDescription('Historia spraw moderacyjnych.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addSubcommand((s) =>
    s
      .setName('user')
      .setDescription('Sprawy konkretnego użytkownika')
      .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true)),
  )
  .addSubcommand((s) => s.setName('recent').setDescription('Ostatnie sprawy na serwerze'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Historia spraw wymaga chmury (Supabase + mod-cases-schema.sql).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const sub = interaction.options.getSubcommand();

  if (sub === 'user') {
    const user = interaction.options.getUser('user', true);
    const rows = await cloudSelect<Case>(
      'mod_cases',
      `${SELECT}&guild_id=eq.${interaction.guildId}&user_id=eq.${user.id}&order=created_at.desc&limit=15`,
    );
    const counts = rows.reduce<Record<string, number>>((a, r) => {
      a[r.action] = (a[r.action] ?? 0) + 1;
      return a;
    }, {});
    const summary =
      Object.entries(counts)
        .map(([k, v]) => `${EMOJI[k] ?? '•'} ${v}`)
        .join('  ') || '—';
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle(`📋 Sprawy: ${user.username}`)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(rows.length ? rows.map(line).join('\n\n') : 'Brak spraw.')
      .setFooter({ text: `Razem: ${rows.length} · ${summary}` });
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  // recent
  const rows = await cloudSelect<Case>(
    'mod_cases',
    `${SELECT}&guild_id=eq.${interaction.guildId}&order=created_at.desc&limit=12`,
  );
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('📋 Ostatnie sprawy')
    .setDescription(
      rows.length
        ? rows
            .map(
              (c) =>
                `${EMOJI[c.action] ?? '•'} **${c.action}** — ${c.username || c.user_id || '—'} \`#${c.id.slice(0, 8)}\``,
            )
            .join('\n')
        : 'Brak spraw.',
    );
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
