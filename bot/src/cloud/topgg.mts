// Auto-raport liczby serwerów do top.gg (Discord Bot List). Aktywne TYLKO gdy ustawiony
// TOPGG_TOKEN (token API z https://top.gg/bot/<ID>/webhooks). Bez tokenu = no-op (zero regresji).
// POST https://top.gg/api/bots/{id}/stats { server_count }. Co 30 min; pod shardingiem raportuje
// tylko shard 0 (po agregacji broadcastEval), żeby nie dublować/nadpisywać statystyki.
import type { Client } from 'discord.js';
import { log } from '../lib/log.mts';

const INTERVAL_MS = 30 * 60_000; // 30 min — top.gg zaleca rzadkie raporty

async function serverCount(client: Client): Promise<number> {
  if (client.shard) {
    try {
      const per = (await client.shard.broadcastEval((cl) => cl.guilds.cache.size)) as number[];
      return per.reduce((a, n) => a + n, 0);
    } catch {
      /* fallback: liczniki tego sharda */
    }
  }
  return client.guilds.cache.size;
}

export function startTopgg(client: Client): void {
  const token = process.env.TOPGG_TOKEN;
  if (!token) {
    log.info('[topgg] brak TOPGG_TOKEN — pomijam raport liczby serwerów.');
    return;
  }
  const botId = client.user?.id;
  if (!botId) {
    log.warn('[topgg] brak client.user.id — pomijam.');
    return;
  }
  // Pod shardingiem raportuje tylko jeden proces (shard 0) — inaczej każdy shard nadpisałby liczbę.
  const isWriter = !client.shard || client.shard.ids.includes(0);
  if (!isWriter) return;

  const post = async (): Promise<void> => {
    try {
      const count = await serverCount(client);
      const body: Record<string, number> = { server_count: count };
      if (client.shard) body.shard_count = client.shard.count;
      const r = await fetch(`https://top.gg/api/bots/${botId}/stats`, {
        method: 'POST',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) log.warn(`[topgg] stats ${r.status}: ${await r.text().catch(() => '')}`);
      else log.info(`[topgg] zaraportowano ${count} serwerów.`);
    } catch (e) {
      log.warn('[topgg]', { err: e });
    }
  };

  void post();
  const timer = setInterval(() => void post(), INTERVAL_MS);
  process.once('SIGINT', () => clearInterval(timer));
  process.once('SIGTERM', () => clearInterval(timer));
  log.info(`[topgg] raport liczby serwerów co ${INTERVAL_MS / 60_000} min.`);
}
