// Faza 7 / F10.1 — analityka aktywności: zlicza wiadomości/wejścia/wyjścia per dzień (UTC) i co 5 min
// dopisuje delty do Supabase 'activity_daily'. Akumulacja w pamięci → zero zapisów per-wiadomość.
import type { Client, GuildMember, Message, PartialGuildMember } from 'discord.js';
import { Events } from 'discord.js';
import { cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';

type Delta = { messages: number; joins: number; leaves: number };
const deltas = new Map<string, Delta>();

function bump(guildId: string, k: keyof Delta): void {
  const d = deltas.get(guildId) ?? { messages: 0, joins: 0, leaves: 0 };
  d[k]++;
  deltas.set(guildId, d);
}

async function flush(): Promise<void> {
  if (!hasCloud() || !deltas.size) return;
  const day = new Date().toISOString().slice(0, 10);
  const entries = [...deltas.entries()];
  deltas.clear();
  for (const [guildId, d] of entries) {
    if (!d.messages && !d.joins && !d.leaves) continue;
    const rows = await cloudSelect<Delta>(
      'activity_daily',
      `select=messages,joins,leaves&guild_id=eq.${guildId}&day=eq.${day}`,
    );
    const cur = rows[0] ?? { messages: 0, joins: 0, leaves: 0 };
    await cloudUpsert(
      'activity_daily',
      [
        {
          guild_id: guildId,
          day,
          messages: cur.messages + d.messages,
          joins: cur.joins + d.joins,
          leaves: cur.leaves + d.leaves,
        },
      ],
      'guild_id,day',
    ).catch((e) => console.warn('[activity]', (e as Error).message));
  }
}

export function startActivity(client: Client): void {
  if (!hasCloud()) {
    console.log('[activity] brak chmury — analityka aktywności wyłączona.');
    return;
  }
  client.on(Events.MessageCreate, (m: Message) => {
    if (m.guild && !m.author.bot) bump(m.guild.id, 'messages');
  });
  client.on(Events.GuildMemberAdd, (m: GuildMember) => bump(m.guild.id, 'joins'));
  client.on(Events.GuildMemberRemove, (m: GuildMember | PartialGuildMember) =>
    bump(m.guild.id, 'leaves'),
  );
  setInterval(
    () => void flush().catch((e) => console.warn('[activity]', (e as Error).message)),
    5 * 60_000,
  );
  console.log('[activity] analityka aktywności aktywna (flush co 5 min).');
}
