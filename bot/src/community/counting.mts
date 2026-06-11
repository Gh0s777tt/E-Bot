// Tor 3 — gra w liczenie: kolejne liczby na dedykowanym kanale. Anti-cheat (nie dwa razy z rzędu)
// + rekord serwera + kamienie milowe. Config 'counting_config'; stan w Supabase 'counting_state'.
import { type Client, Events, type Message, type TextChannel } from 'discord.js';
import { cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';

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
  ).catch((e) => console.warn('[counting]', (e as Error).message));
}

export function startCounting(client: Client): void {
  console.log('[counting] aktywny (config z panelu).');
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

      // anti-cheat: ten sam user dwa razy z rzędu
      if (!c.allowSameUser && msg.author.id === st.lastUserId) {
        await msg.react('🚫').catch(() => {});
        if (c.resetOnFail) {
          st.count = 0;
          st.lastUserId = '';
          persist(msg.guild.id, st);
          await ch
            .send(
              `🚫 <@${msg.author.id}> — nie możesz liczyć dwa razy z rzędu! Zaczynamy od **1**.`,
            )
            .catch(() => {});
        }
        return;
      }

      const expected = st.count + 1;
      if (n !== expected) {
        await msg.react('❌').catch(() => {});
        if (c.resetOnFail) {
          const prevRecord = st.record;
          st.count = 0;
          st.lastUserId = '';
          persist(msg.guild.id, st);
          await ch
            .send(
              `❌ Pomyłka! Poprawna liczba to **${expected}**. Licznik wraca do **1**. (rekord serwera: **${prevRecord}**)`,
            )
            .catch(() => {});
        }
        return;
      }

      // poprawnie
      st.count = expected;
      st.lastUserId = msg.author.id;
      const newRecord = expected > st.record;
      if (newRecord) st.record = expected;
      persist(msg.guild.id, st);

      await msg.react(newRecord ? '🏆' : '✅').catch(() => {});
      if (newRecord && expected > 1) {
        await ch.send(`🏆 Nowy rekord serwera: **${expected}**!`).catch(() => {});
      } else if (expected % 100 === 0) {
        await ch.send(`🎉 **${expected}** — kamień milowy! Tak trzymać.`).catch(() => {});
      }
    } catch (e) {
      console.warn('[counting]', (e as Error).message);
    }
  });
}
