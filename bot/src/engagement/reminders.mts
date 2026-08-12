// Faza 6 / B5 — poller przypomnień: wysyła zaległe i oznacza done.

import type { Client, TextChannel } from 'discord.js';
import { cloudSelect, cloudUpdate, cloudUpdateReturning, hasCloud } from '../lib/cloud.mts';
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
    // Audyt 2026-08 (#4): claim przez compare-and-swap (PATCH z filtrem done=eq.false, jak w
    // giełdzie — cloudUpdateReturning) zamiast ślepego UPDATE: przy shardingu / nakładce po
    // restarcie tylko JEDEN proces przejdzie filtr i dostarczy (koniec podwójnych przypomnień).
    const claimed = await cloudUpdateReturning('reminders', `id=eq.${r.id}&done=eq.false`, {
      done: true,
    }).catch(() => []);
    if (!claimed.length) continue; // inny shard/proces już przejął ten wiersz

    // Dostarczenie PO claimie, ale z odkręceniem: wcześniej done=true stawało się PRZED próbą
    // wysyłki i przy skasowanym kanale + zamkniętych DM (albo chwilowym 5xx) przypomnienie
    // przepadało po cichu. Teraz porażka obu ścieżek → done=false + remind_at +5 min (backoff,
    // żeby martwy wiersz nie zapychał okna limit=20 co 30 s) i retry w kolejnych tickach.
    let sent = false;
    if (r.channel_id) {
      const ch = await client.channels.fetch(r.channel_id).catch(() => null);
      if (ch?.isTextBased() && 'send' in ch) {
        sent = await (ch as TextChannel)
          .send(`⏰ <@${r.user_id}> przypomnienie: ${r.message}`)
          .then(() => true)
          .catch(() => false);
      }
    }
    if (!sent) {
      const user = await client.users.fetch(r.user_id).catch(() => null);
      sent =
        (await user?.send(`⏰ Przypomnienie: ${r.message}`).then(
          () => true,
          () => false,
        )) ?? false;
    }
    if (!sent) {
      log.warn('[remind] dostarczenie nie powiodło się — retry za 5 min', { id: r.id });
      await cloudUpdate('reminders', `id=eq.${r.id}`, {
        done: false,
        remind_at: new Date(Date.now() + 5 * 60_000).toISOString(),
      }).catch(() => {});
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
