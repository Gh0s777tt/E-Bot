// Tor F+ — zaplanowane wiadomości BOGATE (RichMessage z Message Studio) sterowane z panelu.
// Tryby: 'once' (jednorazowo, epoch ms), 'daily'/'weekly' (o godzinie HH:MM w strefie Europe/Warsaw,
// DST automatycznie). Config 'scheduled_posts' (PER-SERWER, JSON). Stan ostatniego wysłania w cloud
// 'g:<id>:scheduled_posts_state' (PER-SERWER dedup). Poll co 60 s, iteracja gildii.
import type { Client, Guild, TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { buildSendOptions, hasRich, type RichMessage } from '../lib/richMessage.mts';

type Mode = 'once' | 'daily' | 'weekly';
type Post = {
  id: string;
  enabled: boolean;
  label?: string;
  channelId: string;
  message: RichMessage;
  mode: Mode;
  runAt?: number; // epoch ms (once)
  time?: string; // 'HH:MM' (daily/weekly) w Europe/Warsaw
  weekday?: number; // 0=niedziela … 6=sobota (weekly)
};

function postsFor(guildId: string): Post[] {
  const raw = getGuildSettings(guildId)['scheduled_posts'];
  try {
    const arr = raw ? (JSON.parse(raw) as Post[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// Bieżący czas w strefie Europe/Warsaw (DST automatycznie przez Intl).
function warsawParts(d: Date): { hh: number; mm: number; weekday: number; ymd: string } {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  const wk: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    hh: Number(p.hour),
    mm: Number(p.minute),
    weekday: wk[p.weekday ?? 'Sun'] ?? 0,
    ymd: `${p.year}-${p.month}-${p.day}`,
  };
}

// Czy post powinien wysłać się teraz? (okno catch-up 10 min dla dziennych/tygodniowych)
function dueNow(p: Post, now: Date, lastRun: number | undefined): boolean {
  if (p.mode === 'once') {
    return !!p.runAt && now.getTime() >= p.runAt && (lastRun === undefined || lastRun < p.runAt);
  }
  if (!p.time) return false;
  const [th, tm] = p.time.split(':').map(Number);
  if (Number.isNaN(th) || Number.isNaN(tm)) return false;
  const { hh, mm, weekday, ymd } = warsawParts(now);
  if (p.mode === 'weekly' && weekday !== (p.weekday ?? 0)) return false;
  const delta = hh * 60 + mm - (th * 60 + tm);
  if (delta < 0 || delta > 10) return false; // tylko w oknie [cel, cel+10 min]
  if (lastRun !== undefined && warsawParts(new Date(lastRun)).ymd === ymd) return false; // już dziś
  return true;
}

// Zaplanowane posty JEDNEGO serwera (lista + state per-serwer; `guild.channels.fetch` = izolacja).
async function tickForGuild(guild: Guild): Promise<void> {
  const posts = postsFor(guild.id);
  if (!posts.length) return;
  const stateKey = `g:${guild.id}:scheduled_posts_state`;
  let state: Record<string, number> = {};
  try {
    state = JSON.parse((await cloudGetSetting(stateKey)) || '{}') as Record<string, number>;
  } catch {
    /* pusty stan */
  }
  const now = new Date();
  let changed = false;

  for (const p of posts) {
    if (!p.enabled || !p.channelId || !p.message) continue;
    if (!dueNow(p, now, state[p.id])) continue;
    const ch = await guild.channels.fetch(p.channelId).catch(() => null);
    if (ch?.isTextBased() && 'send' in ch) {
      const vars: Record<string, string> = {
        '{server}': guild.name,
        '{guild}': guild.name,
        '{memberCount}': String(guild.memberCount),
        '{count}': String(guild.memberCount),
      };
      if (hasRich(p.message)) {
        // V2 (components + flaga) albo klasyka (content + embeds) — buildSendOptions decyduje.
        const payload = buildSendOptions(p.message, vars);
        await (ch as TextChannel).send(payload as never).catch(() => {});
      }
    }
    state[p.id] = now.getTime();
    changed = true;
  }

  if (changed) {
    const ids = new Set(posts.map((p) => p.id));
    for (const k of Object.keys(state)) if (!ids.has(k)) delete state[k]; // sprzątanie sierot
    await cloudSetSetting(stateKey, JSON.stringify(state)).catch(() => {});
  }
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  for (const guild of client.guilds.cache.values()) {
    await tickForGuild(guild).catch(() => {});
  }
}

export function startScheduledPosts(client: Client): void {
  if (!hasCloud()) {
    console.log('[scheduled-posts] brak chmury — zaplanowane posty wyłączone.');
    return;
  }
  setInterval(
    () => void tick(client).catch((e) => console.warn('[scheduled-posts]', (e as Error).message)),
    60_000,
  );
  console.log('[scheduled-posts] aktywne per-serwer (poll 60 s, config z panelu).');
}
