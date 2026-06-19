// Etap K — lista serwerów + aktualnie wybrany (do przełącznika serwerów w Topbarze).
// M1 — zawężone do serwerów DOSTĘPNYCH dla zalogowanego użytkownika: właściciel widzi
// wszystkie serwery bota (bypass), pozostali tylko swoje (guild_members ∩ serwery bota).
import { getAccessibleGuildIds, getBotGuilds, getPrimaryGuildId } from '../../../lib/guild';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const [all, accessible, rawCurrent] = await Promise.all([
    getBotGuilds(),
    getAccessibleGuildIds(),
    getPrimaryGuildId(),
  ]);
  const allow = new Set(accessible);
  const guilds = all.filter((g) => allow.has(g.id));
  // Wybrany serwer musi mieścić się w dostępnych (dla właściciela zawsze tak → bez zmian).
  const current = allow.has(rawCurrent) ? rawCurrent : (guilds[0]?.id ?? '');
  return Response.json({ guilds, current });
}
