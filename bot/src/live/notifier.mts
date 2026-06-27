import type { TextChannel } from 'discord.js';
import { ChannelType, type Client, EmbedBuilder } from 'discord.js';
import { getSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { getKickLive } from './kick.mts';
import { getRumbleLive } from './rumble.mts';
import { getTwitchLive } from './twitch.mts';
import type { LiveStatus, Platform } from './types.mts';
import { getYouTubeLive } from './youtube.mts';

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

export function sec(v: string | undefined, def: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export type LiveCfg = Partial<Record<Platform, string>>;

// Parsuje globalny `live_config` (JSON z panelu); brak/błąd → pusty obiekt (env zostaje fallbackiem).
export function parseLiveCfg(raw: string | undefined): LiveCfg {
  if (!raw) return {};
  try {
    const o = JSON.parse(raw) as LiveCfg;
    return o && typeof o === 'object' ? o : {};
  } catch {
    return {};
  }
}

// Kanał źródłowy platformy: panel (`live_config`) WYGRYWA, env = fallback (wstecznie zgodne). Trim.
export function liveChannel(cfg: LiveCfg, envVal: string | undefined, platform: Platform): string {
  return (cfg[platform] || envVal || '').trim();
}

type PlatformDef = {
  name: Platform;
  envKey: string;
  intervalEnv: string;
  intervalDef: number;
  check: (ch: string) => Promise<LiveStatus>;
};
const PLATFORMS: PlatformDef[] = [
  {
    name: 'twitch',
    envKey: 'TWITCH_CHANNEL',
    intervalEnv: 'NOTIFY_TWITCH_INTERVAL_SEC',
    intervalDef: 60,
    check: getTwitchLive,
  },
  {
    name: 'kick',
    envKey: 'KICK_CHANNEL',
    intervalEnv: 'NOTIFY_KICK_INTERVAL_SEC',
    intervalDef: 60,
    check: getKickLive,
  },
  {
    name: 'rumble',
    envKey: 'RUMBLE_LIVESTREAM_API_URL',
    intervalEnv: 'NOTIFY_RUMBLE_INTERVAL_SEC',
    intervalDef: 60,
    check: getRumbleLive,
  },
  {
    name: 'youtube',
    envKey: 'YOUTUBE_LIVE_CHANNEL_ID',
    intervalEnv: 'NOTIFY_YOUTUBE_INTERVAL_SEC',
    intervalDef: 0,
    check: getYouTubeLive,
  },
];

export function startNotifier(client: Client): void {
  // Twitch/Kick/Rumble zawsze aktywne (kanał czytany dynamicznie per tick: panel `live_config` lub
  // env) → zmiana kanału w panelu działa BEZ restartu. YouTube gated na NOTIFY_YOUTUBE_INTERVAL_SEC>0
  // (quota). Brak kanału (panel i env puste) → tick po prostu pomija.
  const sources = PLATFORMS.filter(
    (p) => p.name !== 'youtube' || sec(process.env[p.intervalEnv], 0) > 0,
  ).map((p) => ({
    name: p.name,
    envKey: p.envKey,
    intervalMs: sec(process.env[p.intervalEnv], p.intervalDef || 120) * 1000,
    check: p.check,
  }));

  log.info(
    `[live] monitoruję: ${sources.map((s) => s.name).join(', ')} (kanały z panelu lub .env)`,
  );

  const prev = new Map<Platform, boolean>();

  const tick = async (s: (typeof sources)[number]): Promise<void> => {
    try {
      const cfg = getSettings();
      const channel = liveChannel(parseLiveCfg(cfg.live_config), process.env[s.envKey], s.name);
      if (!channel) return; // brak kanału (panel + env puste) → nic nie monitorujemy
      const st = await s.check(channel);
      const was = prev.get(s.name);
      prev.set(s.name, st.live);
      if (was === undefined || was || !st.live) return; // tylko przejście offline -> online

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
      log.warn(`[live:${s.name}]`, { err: e });
    }
  };

  for (const s of sources) {
    void tick(s);
    setInterval(() => void tick(s), s.intervalMs);
  }
}

export function fillVars(tpl: string, st: LiveStatus, mention: string): string {
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
    log.warn('[live] kanał docelowy niedostępny lub nie jest tekstowy.');
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
  const sent = await (ch as TextChannel).send({ content: content || undefined, embeds: [embed] });
  // Kanał ogłoszeń (News) → auto-crosspost na serwery obserwujące.
  if (ch.type === ChannelType.GuildAnnouncement) await sent.crosspost().catch(() => {});
  log.info(`[live] ogłoszono: ${st.platform} / ${st.channelName}`);
}
