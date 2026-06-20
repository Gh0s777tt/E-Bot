// Faza 7 / F6 — auto-unban tempbanów: poller co 60 s zdejmuje bany, którym minął czas.
// Dane w Supabase 'temp_bans' (zapis przez /mod tempban). Bez chmury = no-op.
import type { Client, Guild } from 'discord.js';
import { cloudDelete, cloudInsert, cloudSelect, hasCloud } from '../lib/cloud.mts';

type TempBan = { id: string; guild_id: string; user_id: string; username: string | null };

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const nowIso = new Date().toISOString();
  const due = await cloudSelect<TempBan>(
    'temp_bans',
    `select=id,guild_id,user_id,username&unban_at=lte.${nowIso}&order=unban_at.asc&limit=25`,
  );
  for (const t of due) {
    // Pod shardingiem: pomiń serwery spoza tego sharda (obsłuży je ich shard) — inaczej KAŻDY shard
    // przetwarzałby KAŻDY wpis (N× REST + N× delete). Single-process: client.shard=null → bez zmian.
    if (client.shard && !client.guilds.cache.has(t.guild_id)) continue;
    const guild = (await client.guilds.fetch(t.guild_id).catch(() => null)) as Guild | null;
    if (guild) {
      await guild.bans.remove(t.user_id, 'Tempban wygasł').catch(() => {});
      await cloudInsert('mod_cases', [
        {
          guild_id: t.guild_id,
          user_id: t.user_id,
          username: t.username,
          moderator_id: null,
          moderator_name: 'System',
          action: 'unban',
          reason: 'Tempban wygasł (auto)',
        },
      ]).catch(() => {});
    }
    // Usuwamy wpis nawet gdy serwer/odbanowanie się nie powiodło — wpis i tak jest „wykorzystany".
    await cloudDelete('temp_bans', `id=eq.${t.id}`).catch(() => {});
  }
}

export function startModeration(client: Client): void {
  if (!hasCloud()) {
    console.log('[moderation] brak chmury — auto-unban tempbanów wyłączony.');
    return;
  }
  console.log('[moderation] auto-unban tempbanów aktywny (poll 60 s).');
  setInterval(
    () => void tick(client).catch((e) => console.warn('[moderation]', (e as Error).message)),
    60_000,
  );
}
