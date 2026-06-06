// Faza 6 / B4 — relay nowych klipów Twitch na kanał Discord. Config z panelu (settings 'creator_config').
// Bot (24/7) odpytuje Helix /clips i wrzuca tylko nowe (dedup po created_at; stan w 'creator_clips_last').
import type { Client, TextChannel } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';
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
let lastTs = 0; // ms — klipy nowsze niż to wrzucamy

function cfg(): { on: boolean; channelId: string; pollMin: number } {
  const raw = getSettings()['creator_config'];
  try {
    const c = raw
      ? (JSON.parse(raw) as { clipRelay?: boolean; clipChannelId?: string; pollMin?: number })
      : {};
    return {
      on: !!c.clipRelay,
      channelId: c.clipChannelId || '',
      pollMin: Math.min(120, Math.max(2, Number(c.pollMin) || 10)),
    };
  } catch {
    return { on: false, channelId: '', pollMin: 10 };
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

async function tick(client: Client): Promise<void> {
  const c = cfg();
  const login = process.env.TWITCH_CHANNEL;
  if (!c.on || !c.channelId || !login) return;
  const id = await resolveBroadcaster(login);
  if (!id) return;

  // init lastTs — z chmury lub "teraz" (by nie spamić starymi klipami przy pierwszym uruchomieniu)
  if (!lastTs) {
    const persisted = hasCloud()
      ? await cloudGetSetting('creator_clips_last')
      : getSettings()['creator_clips_last'];
    lastTs = persisted ? Date.parse(persisted) : Date.now();
    if (!persisted && hasCloud()) {
      await cloudSetSetting('creator_clips_last', new Date(lastTs).toISOString()).catch(() => {});
    }
  }

  const sinceIso = new Date(lastTs - 60_000).toISOString();
  const clips = (await fetchClips(id, sinceIso))
    .filter((cl) => Date.parse(cl.created_at) > lastTs)
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  if (!clips.length) return;

  const ch = await client.channels.fetch(c.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;

  for (const cl of clips) {
    const embed = new EmbedBuilder()
      .setColor(0x9146ff)
      .setAuthor({ name: 'Twitch • nowy klip' })
      .setTitle(cl.title || 'Klip')
      .setURL(cl.url)
      .setFooter({ text: `klip od ${cl.creator_name}` })
      .setTimestamp(new Date(cl.created_at));
    if (cl.thumbnail_url) embed.setImage(cl.thumbnail_url);
    await (ch as TextChannel).send({ content: cl.url, embeds: [embed] }).catch(() => {});
    lastTs = Math.max(lastTs, Date.parse(cl.created_at));
  }
  if (hasCloud()) {
    await cloudSetSetting('creator_clips_last', new Date(lastTs).toISOString()).catch(() => {});
  }
  console.log(`[clips] wrzucono ${clips.length} nowych klipów`);
}

export function startClipRelay(client: Client): void {
  if (!process.env.TWITCH_CHANNEL || !process.env.TWITCH_CLIENT_ID) {
    console.log('[clips] brak TWITCH_CHANNEL/TWITCH_CLIENT_ID — relay klipów wyłączony.');
    return;
  }
  console.log('[clips] relay klipów aktywny (config z panelu /creator).');
  const loop = async (): Promise<void> => {
    try {
      await tick(client);
    } catch (e) {
      console.warn('[clips]', (e as Error).message);
    }
    setTimeout(() => void loop(), cfg().pollMin * 60_000);
  };
  setTimeout(() => void loop(), 15_000); // krótka zwłoka po starcie
}
