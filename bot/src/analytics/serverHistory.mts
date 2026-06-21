// Dzienny snapshot rozmiaru serwera → cloud key PER-SERWER `g:<guildId>:server_history` (90 dni).
// Panel rysuje wykres wzrostu z danych WYBRANEGO serwera (chokepoint) — bez przecieku między tenantami
// (luka F5, Audyt #2). Zapis co 30 min (odświeża wpis na dziś), cap 90 dni, osobno dla każdego serwera.

import type { Client, Guild } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';

type Snap = { day: string; members: number; boosts: number; channels: number };

const histories = new Map<string, Snap[]>(); // guildId → historia (90 dni)
const loaded = new Set<string>(); // serwery już wczytane z chmury (lazy)

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function snapshot(g: Guild): Omit<Snap, 'day'> {
  return {
    members: g.memberCount || 0,
    boosts: g.premiumSubscriptionCount ?? 0,
    channels: g.channels.cache.size,
  };
}

async function loadGuild(guildId: string): Promise<Snap[]> {
  if (!loaded.has(guildId)) {
    loaded.add(guildId);
    try {
      const raw = await cloudGetSetting(`g:${guildId}:server_history`);
      const arr = raw ? (JSON.parse(raw) as Snap[]) : [];
      histories.set(guildId, Array.isArray(arr) ? arr : []);
    } catch {
      histories.set(guildId, []);
    }
  }
  return histories.get(guildId) ?? [];
}

async function tickGuild(g: Guild): Promise<void> {
  let hist = await loadGuild(g.id);
  const d = today();
  const agg = snapshot(g);
  const last = hist[hist.length - 1];
  if (last && last.day === d) {
    hist[hist.length - 1] = { day: d, ...agg }; // odśwież dzisiejszy odczyt
  } else {
    hist.push({ day: d, ...agg });
  }
  if (hist.length > 90) {
    hist = hist.slice(-90);
    histories.set(g.id, hist);
  }
  try {
    await cloudSetSetting(`g:${g.id}:server_history`, JSON.stringify(hist));
  } catch {
    /* trudno — następny tick spróbuje ponownie */
  }
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  for (const g of client.guilds.cache.values()) {
    await tickGuild(g).catch(() => {});
  }
}

export function startServerHistory(client: Client): void {
  if (!hasCloud()) {
    log.info('[history] brak Supabase — pomijam snapshot wzrostu.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(() => void tick(client).catch((e) => log.warn('[history]', { err: e })), 30 * 60_000);
  log.info('[history] snapshot rozmiaru serwera co 30 min → g:<id>:server_history (per-serwer).');
}
