// Dzienny snapshot rozmiaru serwera → cloud key PER-SERWER `g:<guildId>:server_history` (90 dni).
// Panel rysuje wykres wzrostu z danych WYBRANEGO serwera (chokepoint) — bez przecieku między tenantami
// (luka F5, Audyt #2). Zapis co 30 min (odświeża wpis na dziś), cap 90 dni, osobno dla każdego serwera.

import type { Client, Guild } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';

export type Snap = { day: string; members: number; boosts: number; channels: number };

const histories = new Map<string, Snap[]>(); // guildId → historia (90 dni)
const loaded = new Set<string>(); // serwery już wczytane z chmury (lazy)

// Upsert dziennego snapshotu: ten sam dzień co ostatni wpis → ODŚWIEŻ (bez duplikatu dnia — inaczej
// wykres dubluje słupki), inny dzień → DOPISZ; cap (90) trzyma NAJNOWSZE (`slice(-cap)`). Czysta (nie
// mutuje wejścia) — stan w `histories` ustawia caller.
export function pushSnap(hist: Snap[], snap: Snap, cap = 90): Snap[] {
  const out = hist.slice();
  const last = out[out.length - 1];
  if (last && last.day === snap.day) {
    out[out.length - 1] = snap;
  } else {
    out.push(snap);
  }
  return out.length > cap ? out.slice(-cap) : out;
}

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
  const hist = pushSnap(await loadGuild(g.id), { day: today(), ...snapshot(g) });
  histories.set(g.id, hist);
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
