// M1 — fakty członkostwa multi-tenant (moduł-LIŚĆ: bez zależności od guild.ts, by uniknąć
// cyklu importów). Orkiestracja dostępu — getAccessibleGuildIds / canAccessGuild / scope
// w getPrimaryGuildId — żyje w guild.ts, które importuje stąd te dwie czyste funkcje.
//
// Model: właściciele (env DASHBOARD_OWNER_IDS) mają pełny dostęp (bypass w guild.ts); pozostali
// użytkownicy — tylko serwery z tabeli `guild_members` (schemat M1) ∩ serwery bota. Tabela startuje
// pusta → dziś realnie działa wyłącznie owner-bypass; enrollment (M4 onboarding) doda wiersze.
import { cache } from 'react';
import { authConfig } from './auth';
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
