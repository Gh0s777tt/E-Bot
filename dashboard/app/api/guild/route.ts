// Meta serwera (kanały/role/emoji) dla komponentów klienckich (np. test w Message Studio).
// Chronione sesją przez proxy. getGuildMeta ma własny 60 s cache → nie zalewa Discord API.
import { getGuildMeta } from '../../../lib/guild';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getGuildMeta());
}
