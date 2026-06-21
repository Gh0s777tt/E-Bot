// Faza 6 / B4 — relay nowych klipów Twitch na kanał Discord. Config z panelu (settings 'creator_config').
// ŹRÓDŁO globalne (kanał Twitch WŁAŚCICIELA z env) → dedup globalny 'creator_clips_last'. DESTYNACJA
// PER-SERWER (clipChannelId z creator_config): ten sam klip trafia na kanał każdego serwera z relayem.
import type { Client, Guild, TextChannel } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { twitchToken } from '../live/tokens.mts';

type Clip = {
  id: string;
  url: string;
  title: string;
  created_at: string;
  thumbnail_url: string;
  creator_name: string;
};

let broadcasterId = '';
let lastTs = 0; // ms — klipy nowsze niż to wrzucamy (globalne, jedno źródło Twitch)

// Destynacja PER-SERWER (źródło wspólne). `pollMin` zniknął z per-serwer — loop ma stały interwał.
function cfgFor(guildId: string): { on: boolean; channelId: string } {
  const raw = getGuildSettings(guildId)['creator_config'];
  try {
    const c = raw ? (JSON.parse(raw) as { clipRelay?: boolean; clipChannelId?: string }) : {};
    return { on: !!c.clipRelay, channelId: c.clipChannelId || '' };
  } catch {
    return { on: false, channelId: '' };
  }
}

async function resolveBroadcaster(login: string): Promise<string> {
  if (broadcasterId) return broadcasterId;
  const token = await twitchToken();
  const r = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`, {
    headers: { 'Client-Id': process.env.TWITCH_CLIENT_ID ?? '', Authorization: `Bearer ${token}` },
  });
  const j = (await r.json()) as { data?: { id: string }[] };
  broadcasterId = j.data?.[0]?.id ?? '';
  return broadcasterId;
}

async function fetchClips(id: string, sinceIso: string): Promise<Clip[]> {
  const token = await twitchToken();
  const url = `https://api.twitch.tv/helix/clips?broadcaster_id=${id}&first=20&started_at=${sinceIso}&ended_at=${new Date().toISOString()}`;
  const r = await fetch(url, {
    headers: { 'Client-Id': process.env.TWITCH_CLIENT_ID ?? '', Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return [];
  return ((await r.json()) as { data?: Clip[] }).data ?? [];
}

function clipEmbed(cl: Clip): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x9146ff)
    .setAuthor({ name: 'Twitch • nowy klip' })
    .setTitle(cl.title || 'Klip')
    .setURL(cl.url)
    .setFooter({ text: `klip od ${cl.creator_name}` })
    .setTimestamp(new Date(cl.created_at));
  if (cl.thumbnail_url) embed.setImage(cl.thumbnail_url);
  return embed;
}

async function postForGuild(guild: Guild, clips: Clip[]): Promise<void> {
  const c = cfgFor(guild.id);
  if (!c.on || !c.channelId) return;
  const ch = await guild.channels.fetch(c.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;
  for (const cl of clips) {
    await (ch as TextChannel).send({ content: cl.url, embeds: [clipEmbed(cl)] }).catch(() => {});
  }
}

async function tick(client: Client): Promise<void> {
  const login = process.env.TWITCH_CHANNEL;
  if (!login || !hasCloud()) return;
  const id = await resolveBroadcaster(login);
  if (!id) return;

  // init lastTs — z chmury lub „teraz" (by nie spamić starymi klipami przy pierwszym uruchomieniu).
  if (!lastTs) {
    const persisted = await cloudGetSetting('creator_clips_last');
    lastTs = persisted ? Date.parse(persisted) : Date.now();
    if (!persisted) {
      await cloudSetSetting('creator_clips_last', new Date(lastTs).toISOString()).catch(() => {});
    }
  }

  const sinceIso = new Date(lastTs - 60_000).toISOString();
  const clips = (await fetchClips(id, sinceIso))
    .filter((cl) => Date.parse(cl.created_at) > lastTs)
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  if (!clips.length) return;

  for (const guild of client.guilds.cache.values()) {
    await postForGuild(guild, clips).catch(() => {});
  }
  lastTs = Math.max(lastTs, ...clips.map((cl) => Date.parse(cl.created_at)));
  await cloudSetSetting('creator_clips_last', new Date(lastTs).toISOString()).catch(() => {});
  console.log(`[clips] wrzucono ${clips.length} nowych klipów (per-serwer)`);
}

export function startClipRelay(client: Client): void {
  if (!process.env.TWITCH_CHANNEL || !process.env.TWITCH_CLIENT_ID) {
    console.log('[clips] brak TWITCH_CHANNEL/TWITCH_CLIENT_ID — relay klipów wyłączony.');
    return;
  }
  console.log('[clips] relay klipów aktywny per-serwer (config z panelu /creator).');
  const loop = async (): Promise<void> => {
    try {
      await tick(client);
    } catch (e) {
      console.warn('[clips]', (e as Error).message);
    }
    setTimeout(() => void loop(), 10 * 60_000); // stały interwał (per-serwer pollMin był globalny)
  };
  setTimeout(() => void loop(), 15_000); // krótka zwłoka po starcie
}
