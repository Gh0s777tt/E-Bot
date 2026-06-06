// Faza 6 / B3 — pobiera role i kanały serwera z Discord REST (bot token), aby panel
// mógł oferować listy rozwijane zamiast wklejania ID. Guild ID: jawne DISCORD_GUILD_ID
// (jeśli to poprawny snowflake), inaczej auto-detekcja pierwszego serwera bota (E-Bot jest na 1).
import { cache } from 'react';

export type GuildRole = { id: string; name: string; color: number; position: number };
export type GuildChannel = { id: string; name: string; type: number; position: number };
export type GuildMeta = { ok: boolean; roles: GuildRole[]; channels: GuildChannel[] };

const EMPTY: GuildMeta = { ok: false, roles: [], channels: [] };

async function dfetch<T>(path: string, token: string): Promise<T> {
  const r = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${token}` },
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`Discord ${path} → ${r.status}`);
  return (await r.json()) as T;
}

// Główny serwer bota: jawny DISCORD_GUILD_ID (gdy to snowflake), inaczej auto-detekcja.
export const getPrimaryGuildId = cache(async (): Promise<string> => {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return '';
  const envId = (process.env.DISCORD_GUILD_ID || '').trim();
  if (/^\d{15,}$/.test(envId)) return envId;
  try {
    const guilds = await dfetch<{ id: string }[]>('/users/@me/guilds', token);
    return guilds[0]?.id ?? '';
  } catch {
    return '';
  }
});

export const getGuildMeta = cache(async (): Promise<GuildMeta> => {
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

    const roles = rolesRaw
      .filter((r) => r.id !== guildId && !r.managed && r.name !== '@everyone')
      .map((r) => ({ id: r.id, name: r.name, color: r.color, position: r.position }))
      .sort((a, b) => b.position - a.position);

    const channels = channelsRaw
      .map((c) => ({ id: c.id, name: c.name, type: c.type, position: c.position }))
      .sort((a, b) => a.position - b.position);

    return { ok: true, roles, channels };
  } catch {
    return EMPTY; // brak tokenu / błąd API → formularze pokażą pola tekstowe (fallback na ID)
  }
});
