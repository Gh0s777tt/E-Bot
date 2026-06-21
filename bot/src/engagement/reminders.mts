// Faza 6 / B5 — poller przypomnień: wysyła zaległe i oznacza done.

import type { Client, TextChannel } from 'discord.js';
import { cloudSelect, cloudUpdate, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';

type Reminder = { id: string; user_id: string; channel_id: string | null; message: string };

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const nowIso = new Date().toISOString();
  const due = await cloudSelect<Reminder>(
    'reminders',
    `select=id,user_id,channel_id,message&done=eq.false&remind_at=lte.${nowIso}&order=remind_at.asc&limit=20`,
  );
  for (const r of due) {
    await cloudUpdate('reminders', `id=eq.${r.id}`, { done: true }).catch(() => {});
    let sent = false;
    if (r.channel_id) {
      const ch = await client.channels.fetch(r.channel_id).catch(() => null);
      if (ch?.isTextBased() && 'send' in ch) {
        await (ch as TextChannel)
          .send(`⏰ <@${r.user_id}> przypomnienie: ${r.message}`)
          .catch(() => {});
        sent = true;
      }
    }
    if (!sent) {
      const user = await client.users.fetch(r.user_id).catch(() => null);
      await user?.send(`⏰ Przypomnienie: ${r.message}`).catch(() => {});
    }
  }
}

export function startReminders(client: Client): void {
  if (!hasCloud()) {
    log.info('[remind] brak chmury — przypomnienia wyłączone.');
    return;
  }
  log.info('[remind] przypomnienia aktywne (poll 30s).');
  setInterval(() => void tick(client).catch((e) => log.warn('[remind]', { err: e })), 30_000);
}
