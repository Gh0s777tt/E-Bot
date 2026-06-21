// Faza 7 / F10.1 + Tor E + Tor L — analityka: per-serwer (messages/joins/leaves/voice) ORAZ
// per-user (top aktywni) i per-godzina (heatmapa). Akumulacja w pamięci → flush co 5 min.
// Zapisy per-user/per-hour i voice mają per-item try/catch (brak tabel/kolumn przed SQL = pomijane,
// bez regresji dla głównych liczników).

import type { Client, GuildMember, Message, PartialGuildMember } from 'discord.js';
import { Events } from 'discord.js';
import { cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';

type Delta = { messages: number; joins: number; leaves: number; voice: number };
const deltas = new Map<string, Delta>();
const perUser = new Map<string, { messages: number; voice: number; username: string }>(); // guild|user
const perHour = new Map<string, number>(); // guild|hour

function bump(guildId: string, k: keyof Delta, amount = 1): void {
  const d = deltas.get(guildId) ?? { messages: 0, joins: 0, leaves: 0, voice: 0 };
  d[k] += amount;
  deltas.set(guildId, d);
}
function bumpUser(
  guildId: string,
  userId: string,
  username: string,
  k: 'messages' | 'voice',
  amount = 1,
): void {
  const key = `${guildId}|${userId}`;
  const u = perUser.get(key) ?? { messages: 0, voice: 0, username };
  u[k] += amount;
  u.username = username;
  perUser.set(key, u);
}
function bumpHour(guildId: string, hour: number): void {
  const key = `${guildId}|${hour}`;
  perHour.set(key, (perHour.get(key) ?? 0) + 1);
}

type Row = { messages?: number; joins?: number; leaves?: number; voice_minutes?: number };

async function flushGuild(day: string): Promise<void> {
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
      await cloudUpsert('activity_daily', [base], 'guild_id,day').catch((e) =>
        log.warn('[activity]', { err: e }),
      );
    }
  }
}

async function flushUsers(day: string): Promise<void> {
  const ue = [...perUser.entries()];
  perUser.clear();
  for (const [key, u] of ue) {
    if (!u.messages && !u.voice) continue;
    const [g, uid] = key.split('|');
    try {
      const rows = await cloudSelect<{ messages?: number; voice_min?: number }>(
        'user_activity',
        `select=messages,voice_min&guild_id=eq.${g}&user_id=eq.${uid}&day=eq.${day}`,
      ).catch(() => [] as { messages?: number; voice_min?: number }[]);
      const cur = rows[0] ?? {};
      await cloudUpsert(
        'user_activity',
        [
          {
            guild_id: g,
            user_id: uid,
            username: u.username,
            day,
            messages: (cur.messages ?? 0) + u.messages,
            voice_min: (cur.voice_min ?? 0) + u.voice,
          },
        ],
        'guild_id,user_id,day',
      );
    } catch {
      /* tabela user_activity może nie istnieć przed SQL — pomiń */
    }
  }
}

async function flushHours(): Promise<void> {
  const he = [...perHour.entries()];
  perHour.clear();
  for (const [key, n] of he) {
    const [g, hr] = key.split('|');
    try {
      const rows = await cloudSelect<{ messages?: number }>(
        'activity_hourly',
        `select=messages&guild_id=eq.${g}&hour=eq.${hr}`,
      ).catch(() => [] as { messages?: number }[]);
      await cloudUpsert(
        'activity_hourly',
        [{ guild_id: g, hour: Number(hr), messages: (rows[0]?.messages ?? 0) + n }],
        'guild_id,hour',
      );
    } catch {
      /* tabela activity_hourly może nie istnieć przed SQL — pomiń */
    }
  }
}

async function flush(): Promise<void> {
  if (!hasCloud()) return;
  const day = new Date().toISOString().slice(0, 10);
  await flushGuild(day);
  await flushUsers(day);
  await flushHours();
}

export function startActivity(client: Client): void {
  if (!hasCloud()) {
    log.info('[activity] brak chmury — analityka aktywności wyłączona.');
    return;
  }
  client.on(Events.MessageCreate, (m: Message) => {
    if (m.guild && !m.author.bot) {
      bump(m.guild.id, 'messages');
      bumpUser(m.guild.id, m.author.id, m.author.username, 'messages');
      bumpHour(m.guild.id, new Date().getUTCHours());
    }
  });
  client.on(Events.GuildMemberAdd, (m: GuildMember) => bump(m.guild.id, 'joins'));
  client.on(Events.GuildMemberRemove, (m: GuildMember | PartialGuildMember) =>
    bump(m.guild.id, 'leaves'),
  );

  setInterval(() => {
    for (const guild of client.guilds.cache.values()) {
      for (const ch of guild.channels.cache.values()) {
        if (ch.isVoiceBased() && ch.id !== guild.afkChannelId) {
          for (const mm of ch.members.values()) {
            if (!mm.user.bot) {
              bump(guild.id, 'voice');
              bumpUser(guild.id, mm.id, mm.user.username, 'voice');
            }
          }
        }
      }
    }
  }, 60_000);

  setInterval(() => void flush().catch((e) => log.warn('[activity]', { err: e })), 5 * 60_000);
  log.info('[activity] analityka aktywna (serwer + per-user + heatmapa; flush co 5 min).');
}
