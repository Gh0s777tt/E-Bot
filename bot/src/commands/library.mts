import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import path from 'node:path';

function dbPath(): string {
  const candidates = [
    path.join(import.meta.dirname, '..', '..', '..', 'data', 'bot.db'), // bot/src/commands -> repo/data
    path.join(process.cwd(), 'data', 'bot.db'),
    path.join(process.cwd(), '..', 'data', 'bot.db'),
  ];
  return candidates.find((p) => existsSync(p)) ?? candidates[0];
}

export const data = new SlashCommandBuilder()
  .setName('library')
  .setDescription('Twoja biblioteka gier (Steam + IGDB).')
  .addStringOption((o) => o.setName('szukaj').setDescription('Filtr po tytule'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const q = interaction.options.getString('szukaj');
  const file = dbPath();
  if (!existsSync(file)) {
    await interaction.reply({ content: 'Baza pusta. Uruchom `node ingest/sync.mts`.' });
    return;
  }

  const db = new DatabaseSync(file);
  const rows = q
    ? db
        .prepare(
          'SELECT title, release_year, playtime_min FROM games WHERE title LIKE ? ORDER BY playtime_min DESC LIMIT 15',
        )
        .all(`%${q}%`)
    : db
        .prepare('SELECT title, release_year, playtime_min FROM games ORDER BY playtime_min DESC LIMIT 15')
        .all();
  const total = (db.prepare('SELECT COUNT(*) AS c FROM games').get() as { c: number }).c;
  db.close();

  const list = rows.length
    ? rows
        .map(
          (r: any, i: number) =>
            `**${i + 1}.** ${r.title}${r.release_year ? ` (${r.release_year})` : ''} — ${(r.playtime_min / 60).toFixed(0)} h`,
        )
        .join('\n')
    : 'Brak wyników.';

  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle(`🎮 Biblioteka gier${q ? ` — „${q}”` : ''}`)
    .setDescription(list)
    .setFooter({ text: `Łącznie ${total} gier · źródło: Steam + IGDB` });

  await interaction.reply({ embeds: [embed] });
}
