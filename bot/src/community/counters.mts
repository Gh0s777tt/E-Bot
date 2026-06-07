// Faza 7 / F7.4 — liczniki kanałów: nazwy wybranych kanałów pokazują statystyki serwera.
// Config 'counters_config'. Poll co 10 min (Discord limituje zmianę nazwy kanału do 2/10 min!).
// Liczone tanio z gateway/cache (bez fetchowania członków): members/boosts/channels/roles.
import type { Client, Guild } from 'discord.js';
import { getSettings } from '../lib/db.mts';

type CounterType = 'members' | 'boosts' | 'channels' | 'roles';
type Item = { channelId: string; type: CounterType; template: string };
type CountersConfig = { enabled: boolean; items: Item[] };

const DEFAULT: CountersConfig = { enabled: false, items: [] };
let cfg: CountersConfig = { ...DEFAULT };

function refresh(): void {
  const raw = getSettings()['counters_config'];
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<CountersConfig>) } : { ...DEFAULT };
  } catch {
    /* zostaw poprzedni */
  }
}

function countOf(guild: Guild, type: CounterType): number {
  switch (type) {
    case 'members':
      return guild.memberCount;
    case 'boosts':
      return guild.premiumSubscriptionCount ?? 0;
    case 'channels':
      return guild.channels.cache.size;
    case 'roles':
      return guild.roles.cache.size;
    default:
      return 0;
  }
}

async function tick(client: Client): Promise<void> {
  if (!cfg.enabled) return;
  for (const it of cfg.items) {
    if (!it.channelId) continue;
    const ch = await client.channels.fetch(it.channelId).catch(() => null);
    if (!ch || !('guild' in ch) || !('setName' in ch)) continue;
    const name = it.template.replace('{count}', String(countOf(ch.guild, it.type))).slice(0, 100);
    if (ch.name !== name) await ch.setName(name).catch(() => {});
  }
}

export function startCounters(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => console.warn('[counters]', (e as Error).message)),
    600_000, // 10 min — bezpiecznie pod limitem zmiany nazwy kanału
  );
  console.log('[counters] liczniki kanałów aktywne (poll 10 min, config z panelu).');
}
