export type BotProfile = { id: string; username: string; avatarUrl: string | null };

export async function getBotProfile(): Promise<BotProfile | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return null;
  try {
    const r = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bot ${token}` },
      cache: 'no-store',
    });
    if (!r.ok) return null;
    const d = (await r.json()) as { id: string; username: string; avatar: string | null };
    return {
      id: d.id,
      username: d.username,
      avatarUrl: d.avatar
        ? `https://cdn.discordapp.com/avatars/${d.id}/${d.avatar}.png?size=128`
        : null,
    };
  } catch {
    return null;
  }
}
