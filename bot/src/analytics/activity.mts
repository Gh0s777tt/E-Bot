// Faza 7 / F10.1 + Tor E — analityka aktywności: wiadomości/wejścia/wyjścia + MINUTY VOICE per dzień
// (UTC). Akumulacja w pamięci → flush co 5 min do Supabase 'activity_daily'. Zapis voice_minutes ma
// fallback (gdyby kolumna jeszcze nie istniała przed ALTER — wtedy zapisujemy bez niej, bez regresji).
import type { Client, GuildMember, Message, PartialGuildMember } from 'discord.js';
import { Events } from 'discord.js';
import { cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';

type Delta = { messages: number; joins: number; leaves: number; voice: number };
const deltas = new Map<string, Delta>();

function bump(guildId: string, k: keyof Delta, amount = 1): void {
  const d = deltas.get(guildId) ?? { messages: 0, joins: 0, leaves: 0, voice: 0 };
  d[k] += amount;
  deltas.set(guildId, d);
}

type Row = { messages?: number; joins?: number; leaves?: number; voice_minutes?: number };

async function flush(): Promise<void> {
  if (!hasCloud() || !deltas.size) return;
  const day = new Date().toISOString().slice(0, 10);
  const entries = [...deltas.entries()];
  deltas.clear();
  for (const [guildId, d] of entries) {
    if (!d.messages && !d.joins && !d.leaves && !d.voice) continue;
    const rows = await cloudSelect<Row>(
      'activity_daily',
      `select=*&guild_id=eq.${guildId}&day=eq.${day}`,
    ).catch(() => [] as Row[]);
    const cur = rows[0] ?? {};
    const base = {
      guild_id: guildId,
      day,
      messages: (cur.messages ?? 0) + d.messages,
      joins: (cur.joins ?? 0) + d.joins,
      leaves: (cur.leaves ?? 0) + d.leaves,
    };
    try {
      await cloudUpsert(
        'activity_daily',
        [{ ...base, voice_minutes: (cur.voice_minutes ?? 0) + d.voice }],
        'guild_id,day',
      );
    } catch {
      // kolumna voice_minutes może jeszcze nie istnieć (przed ALTER) → zapis bez niej
      await cloudUpsert('activity_daily', [base], 'guild_id,day').catch((e) =>
        console.warn('[activity]', (e as Error).message),
      );
    }
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

  // Minuty voice — co 60 s dodaj liczbę ludzi w kanałach głosowych (poza AFK).
  setInterval(() => {
    for (const guild of client.guilds.cache.values()) {
      let humans = 0;
      for (const ch of guild.channels.cache.values()) {
        if (ch.isVoiceBased() && ch.id !== guild.afkChannelId) {
          humans += [...ch.members.values()].filter((mm) => !mm.user.bot).length;
        }
      }
      if (humans) bump(guild.id, 'voice', humans);
    }
  }, 60_000);

  setInterval(
    () => void flush().catch((e) => console.warn('[activity]', (e as Error).message)),
    5 * 60_000,
  );
  console.log('[activity] analityka aktywna (wiadomości/wejścia/wyjścia/voice; flush co 5 min).');
}
