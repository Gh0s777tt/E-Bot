// Tor F — zaplanowane/cykliczne ogłoszenia. Poller co 60 s: wysyła wiadomości, których run_at minął;
// jednorazowe usuwa, cykliczne przesuwa o interval_min. Dane w Supabase 'scheduled_messages'.

import type { Client, TextChannel } from 'discord.js';
import { cloudDelete, cloudSelect, cloudUpdate, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';

type Sched = {
  id: string;
  channel_id: string;
  message: string;
  run_at: string;
  interval_min: number;
};

export function startScheduler(client: Client): void {
  log.info('[scheduler] aktywny (zaplanowane ogłoszenia).');
  setInterval(async () => {
    try {
      if (!hasCloud()) return;
      const due = await cloudSelect<Sched>(
        'scheduled_messages',
        `select=id,channel_id,message,run_at,interval_min&run_at=lte.${new Date().toISOString()}&limit=50`,
      ).catch(() => [] as Sched[]);
      for (const s of due) {
        const ch = await client.channels.fetch(s.channel_id).catch(() => null);
        if (ch?.isTextBased() && 'send' in ch) {
          await (ch as TextChannel).send(s.message.slice(0, 2000)).catch(() => {});
        }
        if (s.interval_min && s.interval_min > 0) {
          const next = new Date(Date.now() + s.interval_min * 60_000).toISOString();
          await cloudUpdate('scheduled_messages', `id=eq.${s.id}`, { run_at: next }).catch(
            () => {},
          );
        } else {
          await cloudDelete('scheduled_messages', `id=eq.${s.id}`).catch(() => {});
        }
      }
    } catch (e) {
      log.warn('[scheduler]', { err: e });
    }
  }, 60_000);
}
