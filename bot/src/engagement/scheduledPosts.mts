// Tor F+ — zaplanowane wiadomości BOGATE (RichMessage z Message Studio) sterowane z panelu.
// Tryby: 'once' (jednorazowo, epoch ms), 'daily'/'weekly' (o godzinie HH:MM w strefie Europe/Warsaw,
// DST automatycznie). Config w settings 'scheduled_posts' (JSON, sync przez bridge). Stan ostatniego
// wysłania w cloud 'scheduled_posts_state' (klucz należący do bota → dedup, jak social_feeds_seen).
// Poll co 60 s. Uzupełnia (nie zastępuje) komendowy /schedule (tabela 'scheduled_messages').
import type { Client, TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';
import { buildRichMessage, type RichMessage } from '../lib/richMessage.mts';

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

let posts: Post[] = [];

function refresh(): void {
  const raw = getSettings()['scheduled_posts'];
  try {
    const arr = raw ? (JSON.parse(raw) as Post[]) : [];
    posts = Array.isArray(arr) ? arr : [];
  } catch {
    /* zostaw poprzednią listę */
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

async function tick(client: Client): Promise<void> {
  if (!posts.length || !hasCloud()) return;
  let state: Record<string, number> = {};
  try {
    state = JSON.parse((await cloudGetSetting('scheduled_posts_state')) || '{}') as Record<
      string,
      number
    >;
  } catch {
    /* pusty stan */
  }
  const now = new Date();
  let changed = false;

  for (const p of posts) {
    if (!p.enabled || !p.channelId || !p.message) continue;
    if (!dueNow(p, now, state[p.id])) continue;
    const ch = await client.channels.fetch(p.channelId).catch(() => null);
    if (ch?.isTextBased() && 'send' in ch) {
      const guild = (ch as TextChannel).guild;
      const vars: Record<string, string> = {
        '{server}': guild?.name ?? '',
        '{guild}': guild?.name ?? '',
        '{memberCount}': String(guild?.memberCount ?? ''),
        '{count}': String(guild?.memberCount ?? ''),
      };
      const payload = buildRichMessage(p.message, vars);
      if (payload.content || payload.embeds.length) {
        await (ch as TextChannel).send(payload).catch(() => {});
      }
    }
    state[p.id] = now.getTime();
    changed = true;
  }

  if (changed) {
    const ids = new Set(posts.map((p) => p.id));
    for (const k of Object.keys(state)) if (!ids.has(k)) delete state[k]; // sprzątanie sierot
    await cloudSetSetting('scheduled_posts_state', JSON.stringify(state)).catch(() => {});
  }
}

export function startScheduledPosts(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  if (!hasCloud()) {
    console.log('[scheduled-posts] brak chmury — zaplanowane posty wyłączone.');
    return;
  }
  setInterval(
    () => void tick(client).catch((e) => console.warn('[scheduled-posts]', (e as Error).message)),
    60_000,
  );
  console.log('[scheduled-posts] aktywne (poll 60 s, config z panelu).');
}
