// Puls bota → Supabase (klucz settings 'bot_status'). Panel czyta to w pasku (świeże < 120 s).
// Zapis co 60 s; przy zamknięciu (SIGINT/SIGTERM) oznacza bota jako offline.
import type { Client } from 'discord.js';
import { cloudSetSetting, hasCloud } from '../lib/cloud.mts';

const INTERVAL_MS = 60_000;

type Counts = { guilds: number; members: number; voice: number; boosts: number; channels: number };

// Liczniki TEGO procesu (pod shardingiem = tylko serwery tego sharda). Funkcja samodzielna,
// bo identyczne ciało wykonuje broadcastEval w procesach pozostałych shardów.
function localCounts(client: Client): Counts {
  let members = 0;
  let voice = 0;
  let boosts = 0;
  let channels = 0;
  for (const g of client.guilds.cache.values()) {
    members += g.memberCount || 0;
    voice += g.voiceStates.cache.filter((v) => v.channelId).size;
    boosts += g.premiumSubscriptionCount ?? 0;
    channels += g.channels.cache.size;
  }
  return { guilds: client.guilds.cache.size, members, voice, boosts, channels };
}

async function payload(client: Client, online: boolean): Promise<string> {
  let c = localCounts(client);
  // Pod shardingiem zsumuj liczniki ze WSZYSTKICH shardów (każdy widzi tylko swoje serwery),
  // żeby panel pokazał globalne sumy, a nie cząstkowe. Single-process: client.shard=null → liczniki
  // lokalne są już globalne (pomijamy broadcastEval).
  if (client.shard) {
    try {
      const all = (await client.shard.broadcastEval((cl) => {
        let members = 0;
        let voice = 0;
        let boosts = 0;
        let channels = 0;
        for (const g of cl.guilds.cache.values()) {
          members += g.memberCount || 0;
          voice += g.voiceStates.cache.filter((v) => v.channelId).size;
          boosts += g.premiumSubscriptionCount ?? 0;
          channels += g.channels.cache.size;
        }
        return { guilds: cl.guilds.cache.size, members, voice, boosts, channels };
      })) as Counts[];
      c = all.reduce(
        (a, x) => ({
          guilds: a.guilds + x.guilds,
          members: a.members + x.members,
          voice: a.voice + x.voice,
          boosts: a.boosts + x.boosts,
          channels: a.channels + x.channels,
        }),
        { guilds: 0, members: 0, voice: 0, boosts: 0, channels: 0 },
      );
    } catch {
      /* fallback: liczniki lokalne tego sharda */
    }
  }
  return JSON.stringify({
    online,
    ...c,
    tag: client.user?.tag ?? 'E-Bot',
    ts: Date.now(),
  });
}

export function startHeartbeat(client: Client): void {
  if (!hasCloud()) {
    console.log('[heartbeat] brak konfiguracji Supabase — pomijam puls.');
    return;
  }

  // Globalny bot_status pisze tylko JEDEN proces: shard 0 (po agregacji broadcastEval) lub
  // single-process. Pozostałe shardy nie zapisują (uniknięcie wyścigu/nadpisań tym samym kluczem).
  const isWriter = !client.shard || client.shard.ids.includes(0);

  const beat = async (): Promise<void> => {
    if (!isWriter) return;
    try {
      await cloudSetSetting('bot_status', await payload(client, true));
    } catch (e) {
      console.warn('[heartbeat]', (e as Error).message);
    }
  };

  void beat();
  const timer = setInterval(() => void beat(), INTERVAL_MS);

  const shutdown = async (sig: string): Promise<void> => {
    clearInterval(timer);
    if (isWriter) {
      try {
        await cloudSetSetting('bot_status', await payload(client, false));
      } catch {
        /* trudno, zamykamy */
      }
    }
    console.log(`[heartbeat] ${sig} — kończę.`);
    process.exit(0);
  };
  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));

  console.log(`[heartbeat] puls do Supabase co ${INTERVAL_MS / 1000}s.`);
}
