// Faza 6 / B3 — pobiera role i kanały serwera z Discord REST (bot token), aby panel
// mógł oferować listy rozwijane zamiast wklejania ID. Guild ID: wybór z cookie 'panel_guild'
// (Etap K — przełącznik serwerów), inaczej jawne DISCORD_GUILD_ID, inaczej pierwszy serwer bota.
import { cookies } from 'next/headers';
import { cache } from 'react';

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

// Wybrany serwer: cookie 'panel_guild' (tylko jeśli bot tam jest) → DISCORD_GUILD_ID → pierwszy.
export const getPrimaryGuildId = cache(async (): Promise<string> => {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return '';
  const guilds = await getBotGuilds();
  const ids = guilds.map((g) => g.id);
  // 1) Wybór z przełącznika — tylko gdy bot faktycznie jest na tym serwerze.
  try {
    const sel = (await cookies()).get('panel_guild')?.value;
    if (sel && ids.includes(sel)) return sel;
  } catch {
    /* brak kontekstu żądania (np. statyczny render) — pomijamy cookie */
  }
  // 2) Jawny serwer z env (snowflake).
  const envId = (process.env.DISCORD_GUILD_ID || '').trim();
  if (/^\d{15,}$/.test(envId)) return envId;
  // 3) Pierwszy serwer bota.
  return ids[0] ?? '';
});

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
