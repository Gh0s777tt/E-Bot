// Zaplanowane posty (Message Studio) — config w settings 'scheduled_posts' (tablica JSON).
// Bot (bot/src/engagement/scheduledPosts.mts) czyta to przez bridge i wysyła wg trybu/godziny.
import { getRawSetting, setRawSetting } from './data';
import { normalizeRich, type RichMessage } from './richMessage';

export type SchedMode = 'once' | 'daily' | 'weekly';
export type ScheduledPost = {
  id: string;
  enabled: boolean;
  label: string;
  channelId: string;
  message: RichMessage;
  mode: SchedMode;
  runAt?: number; // epoch ms (once)
  time?: string; // 'HH:MM' (daily/weekly), strefa Europe/Warsaw
  weekday?: number; // 0=niedziela … 6=sobota (weekly)
};

export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  const raw = await getRawSetting('scheduled_posts');
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as ScheduledPost[];
    if (!Array.isArray(arr)) return [];
    return arr.map((p) => ({ ...p, message: normalizeRich(p.message) }));
  } catch {
    return [];
  }
}

export async function saveScheduledPosts(posts: ScheduledPost[]): Promise<void> {
  await setRawSetting('scheduled_posts', JSON.stringify(posts));
}
