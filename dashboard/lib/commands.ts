// Lista realnie zarejestrowanych slash-komend — pobierana z Discord API (bot token), więc zawsze
// aktualna (bez ręcznej listy). Subkomendy (type 1) i grupy (type 2) wypisujemy osobno.
export type SlashSub = { name: string; description: string };
export type SlashCommand = { name: string; description: string; subs: SlashSub[] };

type ApiOption = { type: number; name: string; description?: string };
type ApiCommand = { name: string; description?: string; options?: ApiOption[] };

export async function getRegisteredCommands(): Promise<SlashCommand[]> {
  const appId = process.env.DISCORD_CLIENT_ID;
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!appId || !token) return [];
  try {
    const r = await fetch(`https://discord.com/api/v10/applications/${appId}/commands`, {
      headers: { Authorization: `Bot ${token}` },
      cache: 'no-store',
    });
    if (!r.ok) return [];
    const data = (await r.json()) as ApiCommand[];
    return data
      .map((c) => ({
        name: c.name,
        description: c.description ?? '',
        subs: (c.options ?? [])
          .filter((o) => o.type === 1 || o.type === 2)
          .map((o) => ({ name: o.name, description: o.description ?? '' })),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}
