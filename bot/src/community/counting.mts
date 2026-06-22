// Tor 3 — gra w liczenie: kolejne liczby na dedykowanym kanale. Anti-cheat (nie dwa razy z rzędu)
// + rekord serwera + kamienie milowe. Config 'counting_config'; stan w Supabase 'counting_state'.

import { type Client, Events, type Message, type TextChannel } from 'discord.js';
import { cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type Cfg = { on: boolean; channelId: string; allowSameUser: boolean; resetOnFail: boolean };
// Etap K — config per-serwer: świeży odczyt (stan gry i tak per-guild), fallback global.
function cfg(guildId: string): Cfg {
  const raw = getGuildSettings(guildId)['counting_config'];
  try {
    const c = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return {
      on: !!c.enabled,
      channelId: String(c.channelId || ''),
      allowSameUser: !!c.allowSameUser,
      resetOnFail: c.resetOnFail !== false, // domyślnie true
    };
  } catch {
    return { on: false, channelId: '', allowSameUser: false, resetOnFail: true };
  }
}

type State = { count: number; lastUserId: string; record: number };

// Werdykt liczenia (czysty, bez side-effectów). Kolejność reguł: najpierw anti-cheat (ten sam user
// dwa razy z rzędu, o ile niedozwolone), potem zgodność z oczekiwaną liczbą (count+1). `record` = czy
// pobity rekord serwera. Handler tylko wykonuje akcje (reakcja/wiadomość/persist) wg werdyktu.
export type CountVerdict =
  | { ok: true; count: number; record: boolean }
  | { ok: false; reason: 'same-user' | 'wrong'; expected: number };

export function checkCount(
  st: State,
  n: number,
  userId: string,
  allowSameUser: boolean,
): CountVerdict {
  const expected = st.count + 1;
  if (!allowSameUser && userId === st.lastUserId)
    return { ok: false, reason: 'same-user', expected };
  if (n !== expected) return { ok: false, reason: 'wrong', expected };
  return { ok: true, count: expected, record: expected > st.record };
}

const mem = new Map<string, State>();

async function load(guildId: string): Promise<State> {
  const cached = mem.get(guildId);
  if (cached) return cached;
  let st: State = { count: 0, lastUserId: '', record: 0 };
  if (hasCloud()) {
    const rows = await cloudSelect<{ count: number; last_user_id: string; record: number }>(
      'counting_state',
      `select=count,last_user_id,record&guild_id=eq.${guildId}`,
    ).catch(() => [] as { count: number; last_user_id: string; record: number }[]);
    if (rows[0])
      st = { count: rows[0].count, lastUserId: rows[0].last_user_id || '', record: rows[0].record };
  }
  mem.set(guildId, st);
  return st;
}

function persist(guildId: string, st: State): void {
  if (!hasCloud()) return;
  void cloudUpsert(
    'counting_state',
    [{ guild_id: guildId, count: st.count, last_user_id: st.lastUserId, record: st.record }],
    'guild_id',
  ).catch((e) => log.warn('[counting]', { err: e }));
}

export function startCounting(client: Client): void {
  log.info('[counting] aktywny (config z panelu).');
  client.on(Events.MessageCreate, async (msg: Message) => {
    try {
      if (msg.author.bot || !msg.guild) return;
      const c = cfg(msg.guild.id);
      if (!c.on || msg.channelId !== c.channelId) return;

      const content = msg.content.trim();
      if (!/^\d+$/.test(content)) return; // tylko czyste liczby; resztę ignorujemy
      const n = Number(content);
      if (!Number.isSafeInteger(n)) return;

      const st = await load(msg.guild.id);
      const ch = msg.channel as TextChannel;
      const v = checkCount(st, n, msg.author.id, c.allowSameUser);

      if (!v.ok) {
        await msg.react(v.reason === 'same-user' ? '🚫' : '❌').catch(() => {});
        if (c.resetOnFail) {
          const prevRecord = st.record;
          st.count = 0;
          st.lastUserId = '';
          persist(msg.guild.id, st);
          await ch
            .send(
              v.reason === 'same-user'
                ? `🚫 <@${msg.author.id}> — nie możesz liczyć dwa razy z rzędu! Zaczynamy od **1**.`
                : `❌ Pomyłka! Poprawna liczba to **${v.expected}**. Licznik wraca do **1**. (rekord serwera: **${prevRecord}**)`,
            )
            .catch(() => {});
        }
        return;
      }

      // poprawnie
      st.count = v.count;
      st.lastUserId = msg.author.id;
      if (v.record) st.record = v.count;
      persist(msg.guild.id, st);

      await msg.react(v.record ? '🏆' : '✅').catch(() => {});
      if (v.record && v.count > 1) {
        await ch.send(`🏆 Nowy rekord serwera: **${v.count}**!`).catch(() => {});
      } else if (v.count % 100 === 0) {
        await ch.send(`🎉 **${v.count}** — kamień milowy! Tak trzymać.`).catch(() => {});
      }
    } catch (e) {
      log.warn('[counting]', { err: e });
    }
  });
}
