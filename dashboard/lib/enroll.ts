// M4 — enrollment multi-tenant. Zapisuje serwer + członkostwo admina do tabel M1
// (guilds / guild_members), idempotentnie (upsert, bez nadpisywania istniejących wpisów).
// Best-effort: brak chmury/tabel → no-op. Wołane z callbacku OAuth przy self-serve loginie.
import { canManageGuild, fetchUserGuilds } from './auth';
import { getBotGuilds } from './guild';
import { hasSupabase, supabase } from './supabase';

export type EnrollRole = 'admin' | 'editor' | 'viewer';

// Pojedynczy serwer + członkostwo (idempotentnie; nie zmienia istniejącego tier/roli).
export async function enrollGuild(
  guildId: string,
  uid: string,
  opts?: { name?: string | null; role?: EnrollRole },
): Promise<boolean> {
  if (!guildId || !uid || !hasSupabase) return false;
  try {
    await supabase()
      .from('guilds')
      .upsert([{ guild_id: guildId, name: opts?.name ?? null }], {
        onConflict: 'guild_id',
        ignoreDuplicates: true,
      });
    await supabase()
      .from('guild_members')
      .upsert([{ guild_id: guildId, discord_id: uid, role: opts?.role ?? 'admin' }], {
        onConflict: 'guild_id,discord_id',
        ignoreDuplicates: true,
      });
    return true;
  } catch {
    return false;
  }
}

// Z listy serwerów użytkownika (OAuth `guilds`) wybiera te, gdzie bot jest obecny ORAZ user ma
// MANAGE_GUILD, i zapisuje go jako admina. Zwraca true, jeśli zapisano ≥1 serwer.
export async function enrollFromDiscord(uid: string, accessToken: string): Promise<boolean> {
  if (!uid || !accessToken) return false;
  const [userGuilds, botGuilds] = await Promise.all([fetchUserGuilds(accessToken), getBotGuilds()]);
  const botIds = new Set(botGuilds.map((g) => g.id));
  const manageable = userGuilds.filter((g) => botIds.has(g.id) && canManageGuild(g));
  if (!manageable.length) return false;
  const results = await Promise.all(
    manageable.map((g) => enrollGuild(g.id, uid, { name: g.name, role: 'admin' })),
  );
  return results.some(Boolean);
}

// Link zaproszenia bota na serwer (Discord OAuth) — krok „dodaj bota" w onboardingu (M4).
// Uprawnienia z env DISCORD_BOT_PERMISSIONS (domyślnie 8 = Administrator; zawęź wg potrzeb).
// Pusty DISCORD_CLIENT_ID → '' (UI pokaże komunikat o braku konfiguracji).
export function botInviteUrl(): string {
  const clientId = process.env.DISCORD_CLIENT_ID || '';
  if (!clientId) return '';
  const permissions = (process.env.DISCORD_BOT_PERMISSIONS || '8').trim();
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'bot applications.commands',
    permissions,
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
