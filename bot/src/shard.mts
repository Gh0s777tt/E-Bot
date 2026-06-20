// Wejście SHARDOWANE (opcjonalne) — uruchamia bota przez discord.js ShardingManager.
//
// Domyślnie bot startuje single-process: `node src/index.mts` (skrypt `start`). Sharding włączasz
// uruchamiając `node src/shard.mts` (skrypt `shard`). Discord WYMUSZA sharding przy ~2500 serwerach;
// poniżej tego progu single-process jest prostszy. Każdy shard to osobny proces `index.mts`, któremu
// discord.js wstrzykuje info o shardzie — `index.mts` nie wymaga zmian (Client czyta je sam).
//
// Liczbę shardów ustala SHARD_COUNT ('auto' = wg zalecenia Discorda; liczba = na sztywno).
// Przewodnik i lista miejsc shard-aware: docs/SHARDING.md.
import { fileURLToPath } from 'node:url';
import { ShardingManager } from 'discord.js';
import { loadEnv } from './env.mts';
import { log } from './lib/log.mts';

loadEnv();

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('[shard] brak DISCORD_BOT_TOKEN — nie startuję.');
  process.exit(1);
}

const raw = (process.env.SHARD_COUNT || 'auto').trim();
const totalShards: number | 'auto' = raw === 'auto' ? 'auto' : Math.max(1, Number(raw) || 1);

const entry = fileURLToPath(new URL('./index.mts', import.meta.url));
const manager = new ShardingManager(entry, { token, totalShards, respawn: true });

manager.on('shardCreate', (shard) => {
  log.info('shard: uruchomiony', { id: shard.id });
  shard.on('death', () => log.warn('shard: proces padł (respawn)', { id: shard.id }));
});

log.info('shard: startuję ShardingManager', { totalShards });
manager.spawn().catch((e) => {
  console.error('[shard] spawn nieudany:', (e as Error).message);
  process.exit(1);
});
