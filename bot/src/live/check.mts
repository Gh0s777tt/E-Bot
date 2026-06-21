// Diagnostyka: wypisuje bieżący status live dla skonfigurowanych platform.
// Uruchom: node src/live/check.mts

import { loadEnv } from '../env.mts';
import { log } from '../lib/log.mts';
import { getKickLive } from './kick.mts';
import { getRumbleLive } from './rumble.mts';
import { getTwitchLive } from './twitch.mts';
import type { LiveStatus } from './types.mts';
import { getYouTubeLive } from './youtube.mts';

loadEnv();

const results: LiveStatus[] = [];
if (process.env.TWITCH_CHANNEL) results.push(await getTwitchLive(process.env.TWITCH_CHANNEL));
if (process.env.KICK_CHANNEL) results.push(await getKickLive(process.env.KICK_CHANNEL));
if (process.env.RUMBLE_LIVESTREAM_API_URL)
  results.push(await getRumbleLive(process.env.RUMBLE_LIVESTREAM_API_URL));
if (process.env.YOUTUBE_LIVE_CHANNEL_ID)
  results.push(await getYouTubeLive(process.env.YOUTUBE_LIVE_CHANNEL_ID));

for (const s of results) {
  log.info(`${s.platform.padEnd(8)} live=${s.live}${s.live ? ` | ${s.title ?? ''}` : ''}`);
}
log.info('\nLegenda: edge-trigger offline→online wyśle embed na NOTIFY_DISCORD_CHANNEL_ID.');
