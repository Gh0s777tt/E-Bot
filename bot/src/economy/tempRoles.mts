// Etap J (eko 2.0) — role czasowe ze sklepu: kup rolę na X dni, bot sam ją zdejmie po czasie.
// Wzorzec jak auto-unban tempbanów (security/moderation.mts): poller co 60 s + Supabase 'temp_roles'.
// Bez chmury = no-op (rola nadana na stałe, bo nie ma gdzie zapisać wygaśnięcia).

import type { Client, Guild } from 'discord.js';
import { cloudDelete, cloudInsert, cloudSelect, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';

type TempRole = { id: string; guild_id: string; user_id: string; role_id: string };

// Nadaje (lub odnawia) rolę czasową: kasuje wcześniejszy wpis tej samej roli dla usera
// (ponowny zakup = przedłużenie od teraz) i zapisuje nowe wygaśnięcie.
export async function grantTempRole(
  guildId: string,
  userId: string,
  roleId: string,
  days: number,
): Promise<void> {
  if (!hasCloud()) return;
  const expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();
  await cloudDelete(
    'temp_roles',
    `guild_id=eq.${guildId}&user_id=eq.${userId}&role_id=eq.${roleId}`,
  ).catch(() => {});
  await cloudInsert('temp_roles', [
    { guild_id: guildId, user_id: userId, role_id: roleId, expires_at: expiresAt },
  ]).catch(() => {});
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const nowIso = new Date().toISOString();
  const due = await cloudSelect<TempRole>(
    'temp_roles',
    `select=id,guild_id,user_id,role_id&expires_at=lte.${nowIso}&order=expires_at.asc&limit=25`,
  );
  for (const r of due) {
    // Pod shardingiem: pomiń serwery spoza tego sharda (obsłuży je ich shard) — inaczej KAŻDY shard
    // przetwarzałby KAŻDY wpis (N× REST + N× delete). Single-process: client.shard=null → bez zmian.
    if (client.shard && !client.guilds.cache.has(r.guild_id)) continue;
    const guild = (await client.guilds.fetch(r.guild_id).catch(() => null)) as Guild | null;
    if (guild) {
      const member = await guild.members.fetch(r.user_id).catch(() => null);
      await member?.roles.remove(r.role_id, 'Rola czasowa wygasła (sklep)').catch(() => {});
    }
    // Usuwamy wpis nawet gdy serwer/zdjęcie się nie powiodło — wpis jest „wykorzystany".
    await cloudDelete('temp_roles', `id=eq.${r.id}`).catch((e) =>
      log.warn('[tempRoles] cleanup temp_roles', { err: e }),
    );
  }
}

export function startTempRoles(client: Client): void {
  if (!hasCloud()) {
    log.info('[temp-roles] brak chmury — role czasowe ze sklepu nadawane na stałe.');
    return;
  }
  setInterval(() => void tick(client).catch((e) => log.warn('[temp-roles]', { err: e })), 60_000);
  log.info('[temp-roles] aktywne (poll 60 s — zdejmowanie wygasłych ról ze sklepu).');
}
