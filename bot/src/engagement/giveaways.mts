// Faza 6 / B5 — poller giveawayów: kończy zaległe i losuje zwycięzców.
import type { Client, TextChannel } from 'discord.js';
import { cloudSelect, cloudUpdate, hasCloud } from '../lib/cloud.mts';

type Gw = { id: string; channel_id: string; prize: string; winners: number };
type Entry = { user_id: string };

function pick<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const nowIso = new Date().toISOString();
  const due = await cloudSelect<Gw>(
    'giveaways',
    `select=id,channel_id,prize,winners&ended=eq.false&ends_at=lte.${nowIso}&limit=10`,
  );
  for (const g of due) {
    await cloudUpdate('giveaways', `id=eq.${g.id}`, { ended: true }).catch(() => {});
    const entries = await cloudSelect<Entry>(
      'giveaway_entries',
      `select=user_id&giveaway_id=eq.${g.id}`,
    );
    const ch = await client.channels.fetch(g.channel_id).catch(() => null);
    if (!ch?.isTextBased() || !('send' in ch)) continue;
    if (!entries.length) {
      await (ch as TextChannel)
        .send(`🎉 Giveaway **${g.prize}** zakończony — brak uczestników. 😢`)
        .catch(() => {});
      continue;
    }
    const winners = pick(
      entries.map((e) => e.user_id),
      Math.min(g.winners, entries.length),
    );
    await (ch as TextChannel)
      .send(
        `🎉 Giveaway **${g.prize}** zakończony!\nGratulacje: ${winners.map((w) => `<@${w}>`).join(', ')}`,
      )
      .catch(() => {});
  }
}

export function startGiveaways(client: Client): void {
  if (!hasCloud()) {
    console.log('[giveaway] brak chmury — giveawaye wyłączone.');
    return;
  }
  console.log('[giveaway] giveawaye aktywne (poll 30s).');
  setInterval(
    () => void tick(client).catch((e) => console.warn('[giveaway]', (e as Error).message)),
    30_000,
  );
}
