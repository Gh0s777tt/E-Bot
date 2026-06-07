// /backlog — osobista lista gier (do ogrania / w trakcie / ukończone / porzucone). Tabela 'backlog'.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { cloudDelete, cloudInsert, cloudSelect, cloudUpdate, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

const STATUS: Record<string, string> = {
  todo: '📥 Do ogrania',
  playing: '🎮 W trakcie',
  done: '✅ Ukończone',
  dropped: '🗑️ Porzucone',
};

function enabled(): boolean {
  const raw = getSettings()['backlog_config'];
  try {
    return raw ? !!(JSON.parse(raw) as { enabled?: boolean }).enabled : false;
  } catch {
    return false;
  }
}

export const data = new SlashCommandBuilder()
  .setName('backlog')
  .setDescription('Twoja lista gier do ogrania.')
  .addSubcommand((s) =>
    s
      .setName('add')
      .setDescription('Dodaj grę do backlogu')
      .addStringOption((o) =>
        o.setName('tytul').setDescription('Tytuł gry').setRequired(true).setMaxLength(200),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('list')
      .setDescription('Pokaż swój backlog')
      .addStringOption((o) =>
        o
          .setName('status')
          .setDescription('Filtruj po statusie')
          .addChoices(
            { name: 'Do ogrania', value: 'todo' },
            { name: 'W trakcie', value: 'playing' },
            { name: 'Ukończone', value: 'done' },
            { name: 'Porzucone', value: 'dropped' },
          ),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('set')
      .setDescription('Zmień status gry')
      .addStringOption((o) =>
        o.setName('tytul').setDescription('Tytuł gry').setRequired(true).setMaxLength(200),
      )
      .addStringOption((o) =>
        o
          .setName('status')
          .setDescription('Nowy status')
          .setRequired(true)
          .addChoices(
            { name: 'Do ogrania', value: 'todo' },
            { name: 'W trakcie', value: 'playing' },
            { name: 'Ukończone', value: 'done' },
            { name: 'Porzucone', value: 'dropped' },
          ),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('remove')
      .setDescription('Usuń grę z backlogu')
      .addStringOption((o) =>
        o.setName('tytul').setDescription('Tytuł gry').setRequired(true).setMaxLength(200),
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!enabled()) {
    await interaction.reply({
      content: '🎮 Backlog jest wyłączony (włącz w panelu).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Backlog wymaga chmury (Supabase + _ALL.sql).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const sub = interaction.options.getSubcommand();
  const filter = `guild_id=eq.${interaction.guildId}&user_id=eq.${interaction.user.id}`;

  if (sub === 'list') {
    const status = interaction.options.getString('status');
    const rows = await cloudSelect<{ title: string; status: string }>(
      'backlog',
      `select=title,status&${filter}${status ? `&status=eq.${status}` : ''}&order=created_at.desc&limit=100`,
    );
    if (!rows.length) {
      await interaction.reply({
        content: 'Twój backlog jest pusty.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const groups: Record<string, string[]> = {};
    for (const r of rows) {
      if (!groups[r.status]) groups[r.status] = [];
      groups[r.status].push(r.title);
    }
    const desc = Object.keys(STATUS)
      .filter((s) => groups[s]?.length)
      .map((s) => `**${STATUS[s]}**\n${groups[s].map((t) => `• ${t}`).join('\n')}`)
      .join('\n\n');
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle(`🎮 Backlog: ${interaction.user.username}`)
      .setDescription(desc.slice(0, 4000));
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  const title = interaction.options.getString('tytul', true).trim();

  if (sub === 'add') {
    await cloudInsert('backlog', [
      {
        guild_id: interaction.guildId,
        user_id: interaction.user.id,
        username: interaction.user.username,
        title,
        status: 'todo',
      },
    ]).catch((e) => console.warn('[backlog]', (e as Error).message));
    await interaction.reply({
      content: `📥 Dodano do backlogu: **${title}**`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (sub === 'set') {
    const status = interaction.options.getString('status', true);
    await cloudUpdate('backlog', `${filter}&title=ilike.${encodeURIComponent(title)}`, {
      status,
    }).catch(() => {});
    await interaction.reply({
      content: `✏️ **${title}** → ${STATUS[status] ?? status}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // remove
  await cloudDelete('backlog', `${filter}&title=ilike.${encodeURIComponent(title)}`).catch(
    () => {},
  );
  await interaction.reply({
    content: `🗑️ Usunięto z backlogu: **${title}**`,
    flags: MessageFlags.Ephemeral,
  });
}
