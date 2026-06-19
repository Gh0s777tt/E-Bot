// M1 — warstwa multi-tenant: dostęp per-guild dla zalogowanego użytkownika.
//
// Model: właściciele (env DASHBOARD_OWNER_IDS) widzą WSZYSTKIE serwery bota (bypass —
// zero regresji dla obecnego panelu jednowłaścicielskiego). Pozostali użytkownicy widzą
// tylko serwery, w których są w tabeli `guild_members` (schemat M1) ORAZ bot jest obecny.
// Tabela startuje pusta → dziś realnie działa wyłącznie owner-bypass; enrollment (M4
// onboarding) doda wiersze. Tylko po stronie serwera (czyta cookie sesji + Supabase).
import { cache } from 'react';
import { authConfig } from './auth';
import { getBotGuilds } from './guild';
import { currentSession } from './panelRoles';
import { hasSupabase, supabase } from './supabase';

export type GuildRole = 'admin' | 'editor' | 'viewer';

// Czy uid jest właścicielem instancji (env). Owner = pełny dostęp do wszystkich serwerów bota.
export function isOwner(uid: string | null | undefined): boolean {
  return !!uid && authConfig().owners.includes(uid);
}

// Serwery z `guild_members` dla danego użytkownika (Discord uid). Graceful: brak chmury → [].
export const getMemberGuildIds = cache(async (uid: string): Promise<string[]> => {
  if (!uid || !hasSupabase) return [];
  try {
    const { data, error } = await supabase()
      .from('guild_members')
      .select('guild_id')
      .eq('discord_id', uid);
    if (error || !data) return [];
    return data.map((r) => String((r as { guild_id: string }).guild_id));
  } catch {
    return []; // brak tabeli / błąd API → brak dodatkowych serwerów (owner-bypass nietknięty)
  }
});

// ID serwerów dostępnych dla BIEŻĄCEJ sesji. Owner → wszystkie serwery bota; inaczej
// przecięcie (serwery bota ∩ członkostwo użytkownika). Brak sesji → [].
export const getAccessibleGuildIds = cache(async (): Promise<string[]> => {
  const session = await currentSession();
  const uid = session?.uid;
  if (!uid) return [];
  const botIds = (await getBotGuilds()).map((g) => g.id);
  if (isOwner(uid)) return botIds; // bypass właściciela — zero regresji
  const mine = new Set(await getMemberGuildIds(uid));
  return botIds.filter((id) => mine.has(id));
});

// Czy bieżący użytkownik ma dostęp do danego serwera (do scope'owania zapytań/akcji w M1+).
export async function canAccessGuild(guildId: string): Promise<boolean> {
  if (!guildId) return false;
  return (await getAccessibleGuildIds()).includes(guildId);
}
