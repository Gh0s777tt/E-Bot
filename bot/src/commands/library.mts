import { existsSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';

// Wiersz biblioteki — te same trzy kolumny czyta ścieżka chmurowa i lokalna.
type GameRow = { title: string; release_year: number | null; playtime_min: number };

function dbPath(): string {
  const candidates = [
    path.join(import.meta.dirname, '..', '..', '..', 'data', 'bot.db'), // bot/src/commands -> repo/data
    path.join(process.cwd(), 'data', 'bot.db'),
    path.join(process.cwd(), '..', 'data', 'bot.db'),
  ];
  return candidates.find((p) => existsSync(p)) ?? candidates[0];
}

// AUDYT B-2 (ten sam błąd, co naprawiono dla web/): /library czytało WYŁĄCZNIE lokalny
// data/bot.db przez node:sqlite. Na Railwayu (gdzie chodzi bot) tego pliku NIE MA —
// biblioteka jest tam ładowana do Supabase przez `pnpm sync:cloud`, więc komenda zawsze
// odpowiadała „Baza pusta". Teraz: gdy skonfigurowana chmura (hasCloud) — czytamy z
// Supabase, dokładnie jak web/lib/db.ts; lokalny SQLite zostaje jako fallback dla dev.
// Pobieramy CAŁĄ listę (z opcjonalnym filtrem) i liczymy total z długości — tak samo jak
// web/getGames(), które też nie limituje; biblioteka jednego streamera to setki wierszy.
async function loadGames(q: string | null): Promise<{ rows: GameRow[]; total: number } | null> {
  if (hasCloud()) {
    const filter = q ? `&title=ilike.*${encodeURIComponent(q)}*` : '';
    const all = await cloudSelect<GameRow>(
      'games',
      `select=title,release_year,playtime_min&order=playtime_min.desc${filter}`,
    );
    return { rows: all.slice(0, 15), total: all.length };
  }
  // Lokalny dev: SQLite. Brak pliku → sygnał „nie ma czego pokazać".
  const file = dbPath();
  if (!existsSync(file)) return null;
  const db = new DatabaseSync(file);
  try {
    const rows = (
      q
        ? db
            .prepare(
              'SELECT title, release_year, playtime_min FROM games WHERE title LIKE ? ORDER BY playtime_min DESC LIMIT 15',
            )
            .all(`%${q}%`)
        : db
            .prepare(
              'SELECT title, release_year, playtime_min FROM games ORDER BY playtime_min DESC LIMIT 15',
            )
            .all()
    ) as GameRow[];
    const total = (db.prepare('SELECT COUNT(*) AS c FROM games').get() as { c: number }).c;
    return { rows, total };
  } finally {
    db.close();
  }
}

export const data = new SlashCommandBuilder()
  .setName('library')
  .setDescription('Twoja biblioteka gier (Steam + IGDB).')
  .addStringOption((o) => o.setName('szukaj').setDescription('Filtr po tytule'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const q = interaction.options.getString('szukaj');
  const data = await loadGames(q);
  if (!data) {
    await interaction.reply({ content: 'Baza pusta. Uruchom `node ingest/sync.mts`.' });
    return;
  }
  const { rows, total } = data;

  const list = rows.length
    ? rows
        .map(
          (r, i) =>
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
