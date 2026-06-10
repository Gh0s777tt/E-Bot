// Twitch Schedule → Discord Scheduled Events (Etap I) — lustruje nadchodzące segmenty
// harmonogramu Twitch jako wydarzenia Discord (External, link do kanału). Config w settings
// 'schedule_sync' {enabled, login}; login domyślnie z env TWITCH_CHANNEL (jak notifier).
// Zsynchronizowane segmenty w settings 'twitch_schedule_synced' (klucz guildId:segmentId).
// Graceful no-op bez TWITCH_CLIENT_ID/SECRET. Odświeżanie co 6 h + natychmiast po /streamsync.
import {
  type Client,
  type Guild,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  PermissionFlagsBits,
} from 'discord.js';
import { getSettings, setSetting } from '../lib/db.mts';
import { twitchToken } from '../live/tokens.mts';

type SyncConfig = { enabled: boolean; login: string };
type SyncedMap = Record<string, { eventId: string; start: string }>;

const HORIZON_MS = 7 * 24 * 60 * 60 * 1000; // tylko segmenty z najbliższych 7 dni
const MAX_PER_GUILD = 5; // nie zalewaj listy wydarzeń
const INTERVAL_MS = 6 * 60 * 60 * 1000;

function envLogin(): string {
  return (process.env.TWITCH_CHANNEL ?? '').trim();
}

export function getSyncConfig(): SyncConfig {
  const raw = getSettings().schedule_sync;
  try {
    const j = raw ? (JSON.parse(raw) as Partial<SyncConfig>) : {};
    return { enabled: j.enabled === true, login: (j.login ?? '').trim() || envLogin() };
  } catch {
    return { enabled: false, login: envLogin() };
  }
}

export function setScheduleSync(enabled: boolean, login?: string): SyncConfig {
  const cur = getSyncConfig();
  const next: SyncConfig = { enabled, login: (login ?? cur.login).trim() || envLogin() };
  setSetting('schedule_sync', JSON.stringify(next));
  return next;
}

export function hasTwitchCreds(): boolean {
  return Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);
}

function loadSynced(): SyncedMap {
  const raw = getSettings().twitch_schedule_synced;
  try {
    const j = raw ? (JSON.parse(raw) as unknown) : {};
    return j && typeof j === 'object' ? (j as SyncedMap) : {};
  } catch {
    return {};
  }
}

export function syncedCount(): number {
  return Object.keys(loadSynced()).length;
}

type Segment = {
  id: string;
  start_time: string;
  end_time: string | null;
  title: string | null;
  canceled_until: string | null;
  category: { name: string } | null;
};

async function helix(path: string): Promise<Response> {
  const token = await twitchToken();
  return fetch(`https://api.twitch.tv/helix/${path}`, {
    headers: { 'Client-Id': process.env.TWITCH_CLIENT_ID ?? '', Authorization: `Bearer ${token}` },
  });
}

const idCache = new Map<string, string>(); // login → broadcaster_id

async function broadcasterId(login: string): Promise<string | null> {
  const hit = idCache.get(login);
  if (hit) return hit;
  const r = await helix(`users?login=${encodeURIComponent(login)}`);
  if (!r.ok) return null;
  const j = (await r.json()) as { data?: { id: string }[] };
  const id = j.data?.[0]?.id ?? null;
  if (id) idCache.set(login, id);
  return id;
}

async function fetchSegments(login: string): Promise<Segment[]> {
  const id = await broadcasterId(login);
  if (!id) return [];
  // 404 = streamer nie ma harmonogramu — to nie błąd.
  const r = await helix(`schedule?broadcaster_id=${id}&first=20`);
  if (!r.ok) return [];
  const j = (await r.json()) as { data?: { segments?: Segment[] | null } };
  const now = Date.now();
  return (j.data?.segments ?? [])
    .filter((s) => {
      if (!s?.id || !s.start_time || s.canceled_until) return false;
      const start = Date.parse(s.start_time);
      return start > now && start - now < HORIZON_MS;
    })
    .slice(0, MAX_PER_GUILD);
}

async function syncGuild(
  guild: Guild,
  login: string,
  segments: Segment[],
  synced: SyncedMap,
): Promise<boolean> {
  const me = guild.members.me ?? (await guild.members.fetchMe().catch(() => null));
  if (!me?.permissions.has(PermissionFlagsBits.ManageEvents)) return false;
  const existing = await guild.scheduledEvents.fetch().catch(() => null);
  if (!existing) return false;
  let changed = false;
  for (const seg of segments) {
    const key = `${guild.id}:${seg.id}`;
    if (synced[key]) continue;
    const start = new Date(seg.start_time);
    const end = seg.end_time
      ? new Date(seg.end_time)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const name = (seg.title ?? '').trim() || `🔴 Stream: ${login}`;
    // Anty-duplikat (np. ręcznie utworzone): ta sama nazwa i start ±5 min.
    const dupe = existing.find(
      (e) =>
        e.name === name &&
        Math.abs((e.scheduledStartTimestamp ?? 0) - start.getTime()) < 5 * 60 * 1000,
    );
    if (dupe) {
      synced[key] = { eventId: dupe.id, start: seg.start_time };
      changed = true;
      continue;
    }
    const ev = await guild.scheduledEvents
      .create({
        name: name.slice(0, 100),
        scheduledStartTime: start,
        scheduledEndTime: end,
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.External,
        entityMetadata: { location: `https://twitch.tv/${login}` },
        description: seg.category?.name
          ? `🎮 ${seg.category.name} — auto-sync z harmonogramu Twitch`
          : 'Auto-sync z harmonogramu Twitch',
      })
      .catch(() => null);
    if (ev) {
      synced[key] = { eventId: ev.id, start: seg.start_time };
      changed = true;
      console.log(`[streamsync] utworzono wydarzenie "${name}" w ${guild.name}`);
    }
  }
  return changed;
}

let warnedNoCreds = false;

export async function syncNow(client: Client): Promise<void> {
  const cfg = getSyncConfig();
  if (!cfg.enabled || !cfg.login) return;
  if (!hasTwitchCreds()) {
    if (!warnedNoCreds) {
      warnedNoCreds = true;
      console.log(
        '[streamsync] brak TWITCH_CLIENT_ID/SECRET — sync uśpiony do czasu dodania kluczy.',
      );
    }
    return;
  }
  try {
    const segments = await fetchSegments(cfg.login);
    const synced = loadSynced();
    // Prune: wpisy starsze niż 24 h po starcie — mapa nie rośnie w nieskończoność.
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    let changed = false;
    for (const [k, v] of Object.entries(synced)) {
      if (Date.parse(v.start) < cutoff) {
        delete synced[k];
        changed = true;
      }
    }
    if (segments.length > 0) {
      for (const guild of client.guilds.cache.values()) {
        if (await syncGuild(guild, cfg.login, segments, synced)) changed = true;
      }
    }
    if (changed) setSetting('twitch_schedule_synced', JSON.stringify(synced));
  } catch (e) {
    console.error('[streamsync] sync nieudany:', e);
  }
}

export function startScheduleSync(client: Client): void {
  setTimeout(() => void syncNow(client), 90_000); // pierwszy przebieg po starcie
  setInterval(() => void syncNow(client), INTERVAL_MS);
  console.log('[streamsync] aktywny (Twitch schedule → Discord Events; /streamsync).');
}
