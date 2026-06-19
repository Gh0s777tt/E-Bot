// Faza 6 / B3 — pobiera role i kanały serwera z Discord REST (bot token), aby panel
// mógł oferować listy rozwijane zamiast wklejania ID. Guild ID: wybór z cookie 'panel_guild'
// (Etap K — przełącznik serwerów), inaczej jawne DISCORD_GUILD_ID, inaczej pierwszy serwer bota.
import { cookies } from 'next/headers';
import { cache } from 'react';
import { getAuthSecret, verifySession } from './session';
import { getMemberGuildIds, isOwner } from './tenant';

export type GuildRole = { id: string; name: string; color: number; position: number };
export type GuildChannel = { id: string; name: string; type: number; position: number };
export type GuildEmoji = { id: string; name: string; animated: boolean };
export type GuildMeta = {
  ok: boolean;
  roles: GuildRole[];
  channels: GuildChannel[];
  emojis: GuildEmoji[];
};

const EMPTY: GuildMeta = { ok: false, roles: [], channels: [], emojis: [] };

async function dfetch<T>(path: string, token: string): Promise<T> {
  const r = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${token}` },
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`Discord ${path} → ${r.status}`);
  return (await r.json()) as T;
}

export type BotGuild = { id: string; name: string; icon: string | null };

// Serwery, na których jest bot (do przełącznika serwerów). Cache per-render.
export const getBotGuilds = cache(async (): Promise<BotGuild[]> => {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return [];
  try {
    const guilds = await dfetch<{ id: string; name: string; icon: string | null }[]>(
      '/users/@me/guilds',
      token,
    );
    return guilds.map((g) => ({ id: g.id, name: g.name, icon: g.icon ?? null }));
  } catch {
    return [];
  }
});

// uid bieżącej sesji — czytany wprost z leaf-session.ts (NIE przez panelRoles), by nie wciągać
// łańcucha panelRoles→data→guild w cykl importów. Brak kontekstu/żądania → null (fail-open).
async function sessionUid(): Promise<string | null> {
  try {
    const token = (await cookies()).get('ebot_session')?.value;
    if (!token) return null;
    return (await verifySession(token, getAuthSecret()))?.uid ?? null;
  } catch {
    return null;
  }
}

// Wybrany serwer: cookie 'panel_guild' (jeśli DOSTĘPNY) → DISCORD_GUILD_ID → pierwszy dostępny.
// M1: zalogowany NIE-właściciel jest zawężony do swoich serwerów (guild_members ∩ bot). Owner
// oraz konteksty bez sesji → pełna lista serwerów bota (zachowanie sprzed M1, zero regresji).
export const getPrimaryGuildId = cache(async (): Promise<string> => {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return '';
  const botIds = (await getBotGuilds()).map((g) => g.id);
  const uid = await sessionUid();
  let ids = botIds;
  if (uid && !isOwner(uid)) {
    const mine = new Set(await getMemberGuildIds(uid));
    ids = botIds.filter((id) => mine.has(id));
  }
  // 1) Wybór z przełącznika — tylko gdy w dostępnych.
  try {
    const sel = (await cookies()).get('panel_guild')?.value;
    if (sel && ids.includes(sel)) return sel;
  } catch {
    /* brak kontekstu żądania (np. statyczny render) — pomijamy cookie */
  }
  // 2) Jawny serwer z env (snowflake) — owner/bez sesji bez zmian; nie-właściciel tylko gdy dostępny.
  const envId = (process.env.DISCORD_GUILD_ID || '').trim();
  if (/^\d{15,}$/.test(envId) && (!uid || isOwner(uid) || ids.includes(envId))) return envId;
  // 3) Pierwszy dostępny serwer.
  return ids[0] ?? '';
});

// ID serwerów dostępnych dla BIEŻĄCEJ sesji (owner → wszystkie serwery bota; inaczej przecięcie
// serwery bota ∩ członkostwo). Brak sesji → [] (używane przez authenticated /api/guilds).
export const getAccessibleGuildIds = cache(async (): Promise<string[]> => {
  const uid = await sessionUid();
  if (!uid) return [];
  const botIds = (await getBotGuilds()).map((g) => g.id);
  if (isOwner(uid)) return botIds;
  const mine = new Set(await getMemberGuildIds(uid));
  return botIds.filter((id) => mine.has(id));
});

// Czy bieżący użytkownik ma dostęp do danego serwera (twardy strażnik do scope'owania akcji w M1+).
export async function canAccessGuild(guildId: string): Promise<boolean> {
  if (!guildId) return false;
  return (await getAccessibleGuildIds()).includes(guildId);
}

// Do ZAPISÓW per-serwer: guild_id wybranego serwera + flaga, czy wolno pisać GLOBALNIE (klucz bez
// prefiksu `g:`). Globalny zapis dozwolony tylko dla właściciela lub kontekstu bez sesji
// (legacy/single-instance). Zalogowany NIE-właściciel (tenant) bez serwera NIE może pisać globalnie
// — inaczej zanieczyściłby config instancji. (Hardening — przegląd bezpieczeństwa marketplace.)
export async function getWriteGuildScope(): Promise<{ gid: string; allowGlobal: boolean }> {
  const uid = await sessionUid();
  const gid = await getPrimaryGuildId();
  return { gid, allowGlobal: !uid || isOwner(uid) };
}

// Cache TTL w pamięci (60 s) — React cache() dedupuje tylko w obrębie jednego renderu;
// to ogranicza realne wywołania Discord API między żądaniami (lekki odpowiednik Redisa).
let memo: { at: number; data: GuildMeta } | null = null;

export const getGuildMeta = cache(async (): Promise<GuildMeta> => {
  if (memo && Date.now() - memo.at < 60_000) return memo.data;
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return EMPTY;
  try {
    const guildId = await getPrimaryGuildId();
    if (!guildId) return EMPTY;

    const [rolesRaw, channelsRaw] = await Promise.all([
      dfetch<{ id: string; name: string; color: number; position: number; managed: boolean }[]>(
        `/guilds/${guildId}/roles`,
        token,
      ),
      dfetch<{ id: string; name: string; type: number; position: number }[]>(
        `/guilds/${guildId}/channels`,
        token,
      ),
    ]);
    // Emoji serwera — tolerancyjnie (błąd nie wywala ról/kanałów; picker emoji w Message Studio).
    const emojisRaw = await dfetch<{ id: string; name: string; animated?: boolean }[]>(
      `/guilds/${guildId}/emojis`,
      token,
    ).catch(() => [] as { id: string; name: string; animated?: boolean }[]);

    const roles = rolesRaw
      .filter((r) => r.id !== guildId && !r.managed && r.name !== '@everyone')
      .map((r) => ({ id: r.id, name: r.name, color: r.color, position: r.position }))
      .sort((a, b) => b.position - a.position);

    const channels = channelsRaw
      .map((c) => ({ id: c.id, name: c.name, type: c.type, position: c.position }))
      .sort((a, b) => a.position - b.position);

    const emojis = (emojisRaw ?? [])
      .filter((e) => e.id && e.name)
      .map((e) => ({ id: e.id, name: e.name, animated: !!e.animated }));

    const data: GuildMeta = { ok: true, roles, channels, emojis };
    memo = { at: Date.now(), data }; // cache tylko sukces (błąd → ponów następnym razem)
    return data;
  } catch {
    return EMPTY; // brak tokenu / błąd API → formularze pokażą pola tekstowe (fallback na ID)
  }
});
