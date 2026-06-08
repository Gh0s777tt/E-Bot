import type { TextChannel } from 'discord.js';
import { type Client, EmbedBuilder } from 'discord.js';
import { getSettings } from '../lib/db.mts';
import { getKickLive } from './kick.mts';
import { getRumbleLive } from './rumble.mts';
import { getTwitchLive } from './twitch.mts';
import type { LiveStatus, Platform } from './types.mts';
import { getYouTubeLive } from './youtube.mts';

type Source = { name: Platform; intervalMs: number; check: () => Promise<LiveStatus> };

const COLORS: Record<Platform, number> = {
  twitch: 0x9146ff,
  kick: 0x53fc18,
  youtube: 0xff0000,
  rumble: 0x85c742,
};
const LABEL: Record<Platform, string> = {
  twitch: 'Twitch',
  kick: 'Kick',
  youtube: 'YouTube',
  rumble: 'Rumble',
};
const DEFAULT_ENABLED: Record<Platform, boolean> = {
  twitch: true,
  kick: true,
  rumble: true,
  youtube: false,
};

function sec(v: string | undefined, def: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export function startNotifier(client: Client): void {
  const sources: Source[] = [];
  if (process.env.TWITCH_CHANNEL)
    sources.push({
      name: 'twitch',
      intervalMs: sec(process.env.NOTIFY_TWITCH_INTERVAL_SEC, 60) * 1000,
      check: () => getTwitchLive(process.env.TWITCH_CHANNEL!),
    });
  if (process.env.KICK_CHANNEL)
    sources.push({
      name: 'kick',
      intervalMs: sec(process.env.NOTIFY_KICK_INTERVAL_SEC, 60) * 1000,
      check: () => getKickLive(process.env.KICK_CHANNEL!),
    });
  if (process.env.RUMBLE_LIVESTREAM_API_URL)
    sources.push({
      name: 'rumble',
      intervalMs: sec(process.env.NOTIFY_RUMBLE_INTERVAL_SEC, 60) * 1000,
      check: () => getRumbleLive(process.env.RUMBLE_LIVESTREAM_API_URL!),
    });
  const ytInt = sec(process.env.NOTIFY_YOUTUBE_INTERVAL_SEC, 0);
  if (process.env.YOUTUBE_LIVE_CHANNEL_ID && ytInt > 0)
    sources.push({
      name: 'youtube',
      intervalMs: ytInt * 1000,
      check: () => getYouTubeLive(process.env.YOUTUBE_LIVE_CHANNEL_ID!),
    });

  if (!sources.length) {
    console.log('[live] brak platform z danymi — pomijam.');
    return;
  }
  console.log(
    `[live] monitoruję: ${sources.map((s) => s.name).join(', ')} (kanał/przełączniki z panelu lub .env)`,
  );

  const prev = new Map<Platform, boolean>();

  const tick = async (s: Source): Promise<void> => {
    try {
      const st = await s.check();
      const was = prev.get(s.name);
      prev.set(s.name, st.live);
      if (was === undefined || was || !st.live) return; // tylko przejście offline -> online

      const cfg = getSettings();
      const enabledRaw = cfg[`notify_enabled_${s.name}`];
      const enabled =
        enabledRaw === undefined
          ? DEFAULT_ENABLED[s.name]
          : enabledRaw === '1' || enabledRaw === 'true';
      const channelId = cfg.notify_channel_id || process.env.NOTIFY_DISCORD_CHANNEL_ID || '';
      if (!enabled || !channelId) return;

      const mention = cfg.notify_mention || process.env.NOTIFY_MENTION || '';
      await announce(
        client,
        channelId,
        mention,
        st,
        cfg.notify_message || '',
        cfg.notify_title || '',
      );
    } catch (e) {
      console.warn(`[live:${s.name}]`, (e as Error).message);
    }
  };

  for (const s of sources) {
    void tick(s);
    setInterval(() => void tick(s), s.intervalMs);
  }
}

function fillVars(tpl: string, st: LiveStatus, mention: string): string {
  return tpl
    .replaceAll('{mention}', mention)
    .replaceAll('{streamer}', st.channelName ?? '')
    .replaceAll('{title}', st.title ?? '')
    .replaceAll('{url}', st.url ?? '')
    .replaceAll('{game}', st.game ?? '')
    .replaceAll('{platform}', LABEL[st.platform])
    .replaceAll('{viewers}', st.viewers != null ? String(st.viewers) : '')
    .trim();
}

async function announce(
  client: Client,
  channelId: string,
  mention: string,
  st: LiveStatus,
  msgTpl: string,
  titleTpl: string,
): Promise<void> {
  const ch = await client.channels.fetch(channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) {
    console.warn('[live] kanał docelowy niedostępny lub nie jest tekstowy.');
    return;
  }
  const title = titleTpl
    ? fillVars(titleTpl, st, mention)
    : `🔴 ${st.channelName ?? ''} jest teraz na żywo!`;
  const embed = new EmbedBuilder()
    .setColor(COLORS[st.platform])
    .setAuthor({ name: `${LABEL[st.platform]} • NA ŻYWO` })
    .setTitle(title.slice(0, 256) || 'NA ŻYWO')
    .setTimestamp(new Date());
  if (st.title) embed.setDescription(st.title);
  if (st.url) embed.setURL(st.url);
  if (st.game) embed.addFields({ name: 'Kategoria', value: st.game, inline: true });
  if (st.viewers != null)
    embed.addFields({ name: 'Widzowie', value: String(st.viewers), inline: true });
  if (st.thumbnail) embed.setImage(st.thumbnail);

  const content = (
    msgTpl ? fillVars(msgTpl, st, mention) : `${mention} ${st.url ?? ''}`.trim()
  ).slice(0, 2000);
  await (ch as TextChannel).send({ content: content || undefined, embeds: [embed] });
  console.log(`[live] ogłoszono: ${st.platform} / ${st.channelName}`);
}
