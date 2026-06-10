// Etap K — lista serwerów bota + aktualnie wybrany (do przełącznika serwerów w Topbarze).
import { getBotGuilds, getPrimaryGuildId } from '../../../lib/guild';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const [guilds, current] = await Promise.all([getBotGuilds(), getPrimaryGuildId()]);
  return Response.json({ guilds, current });
}
