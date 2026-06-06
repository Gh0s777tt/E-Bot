// Faza 6 / B3 — pobiera role i kanały serwera z Discord REST (bot token), aby panel
// mógł oferować listy rozwijane zamiast wklejania ID. Guild ID: env DISCORD_GUILD_ID /
// DISCORD_DEV_GUILD_ID, a jak brak — pierwszy serwer bota (E-Bot jest na 1 serwerze).
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

export const getGuildMeta = cache(async (): Promise<GuildMeta> => {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return EMPTY;
  try {
    let guildId = process.env.DISCORD_GUILD_ID || process.env.DISCORD_DEV_GUILD_ID || '';
    if (!guildId) {
      const guilds = await dfetch<{ id: string }[]>('/users/@me/guilds', token);
      guildId = guilds[0]?.id ?? '';
    }
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
