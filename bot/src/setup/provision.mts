// Architekt serwera — silnik provisioningu. Panel zapisuje zlecenie do cloud key 'setup_provision',
// bot (poll co 4 s) tworzy kategorie/kanały/role (idempotentnie — pomija istniejące po nazwie) i
// zapisuje log do 'setup_provision_result'. Dedup po id zlecenia. Wymaga ManageChannels/ManageRoles.
import {
  ChannelType,
  type Client,
  type Guild,
  type GuildChannelCreateOptions,
  OverwriteType,
  PermissionFlagsBits,
} from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { configWriteKey, getGuildSettings } from '../lib/db.mts';

type Role = { name: string; color?: number; hoist?: boolean };
type Category = { key: string; name: string };
type Channel = {
  name: string;
  kind: 'text' | 'voice' | 'announcement';
  categoryKey?: string;
  lockSend?: boolean;
};
type Plan = { id: string; roles?: Role[]; categories?: Category[]; channels?: Channel[] };
type LogItem = { label: string; ok: boolean; detail?: string; id?: string };

let lastId = '';

function findChannel(guild: Guild, name: string, type: ChannelType) {
  const lc = name.toLowerCase();
  return guild.channels.cache.find((c) => c.type === type && c.name.toLowerCase() === lc) ?? null;
}

async function execute(guild: Guild, plan: Plan): Promise<LogItem[]> {
  const log: LogItem[] = [];

  // Role
  for (const r of plan.roles ?? []) {
    const existing = guild.roles.cache.find((x) => x.name.toLowerCase() === r.name.toLowerCase());
    if (existing) {
      log.push({ label: `Rola: ${r.name}`, ok: true, detail: 'już istnieje', id: existing.id });
      continue;
    }
    try {
      const role = await guild.roles.create({ name: r.name, color: r.color, hoist: r.hoist });
      log.push({ label: `Rola: ${r.name}`, ok: true, detail: 'utworzono', id: role.id });
    } catch (e) {
      log.push({ label: `Rola: ${r.name}`, ok: false, detail: (e as Error).message });
    }
  }

  // Kategorie (zbuduje mapę key → id)
  const catId = new Map<string, string>();
  for (const c of plan.categories ?? []) {
    const existing = findChannel(guild, c.name, ChannelType.GuildCategory);
    if (existing) {
      catId.set(c.key, existing.id);
      log.push({
        label: `Kategoria: ${c.name}`,
        ok: true,
        detail: 'już istnieje',
        id: existing.id,
      });
      continue;
    }
    try {
      const cat = await guild.channels.create({ name: c.name, type: ChannelType.GuildCategory });
      catId.set(c.key, cat.id);
      log.push({ label: `Kategoria: ${c.name}`, ok: true, detail: 'utworzono', id: cat.id });
    } catch (e) {
      log.push({ label: `Kategoria: ${c.name}`, ok: false, detail: (e as Error).message });
    }
  }

  // Kanały
  for (const ch of plan.channels ?? []) {
    const type =
      ch.kind === 'voice'
        ? ChannelType.GuildVoice
        : ch.kind === 'announcement'
          ? ChannelType.GuildAnnouncement
          : ChannelType.GuildText;
    const existing = findChannel(guild, ch.name, type);
    if (existing) {
      log.push({ label: `Kanał: ${ch.name}`, ok: true, detail: 'już istnieje', id: existing.id });
      continue;
    }
    try {
      const opts = {
        name: ch.name,
        type,
        parent: ch.categoryKey ? catId.get(ch.categoryKey) : undefined,
      } as GuildChannelCreateOptions;
      if (ch.lockSend) {
        opts.permissionOverwrites = [
          {
            id: guild.roles.everyone.id,
            type: OverwriteType.Role,
            deny:
              ch.kind === 'voice' ? PermissionFlagsBits.Connect : PermissionFlagsBits.SendMessages,
          },
        ];
      }
      const created = await guild.channels.create(opts);
      log.push({ label: `Kanał: ${ch.name}`, ok: true, detail: 'utworzono', id: created.id });
    } catch (e) {
      log.push({ label: `Kanał: ${ch.name}`, ok: false, detail: (e as Error).message });
    }
  }

  return log;
}

function findId(log: LogItem[], label: string): string | undefined {
  return log.find((l) => l.label === label && l.ok && l.id)?.id;
}

// Etap K — zapisy per-serwer: czytamy widok serwera (getGuildSettings), zapisujemy pod kluczem
// per-serwer dla configów zmigrowanych (configWriteKey), inaczej globalnie.
async function mergeConfig(
  guildId: string,
  key: string,
  patch: Record<string, unknown>,
): Promise<void> {
  let cur: Record<string, unknown> = {};
  try {
    const raw = getGuildSettings(guildId)[key];
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p === 'object' && !Array.isArray(p)) cur = p as Record<string, unknown>;
    }
  } catch {
    /* domyślnie pusty */
  }
  await cloudSetSetting(configWriteKey(guildId, key), JSON.stringify({ ...cur, ...patch })).catch(
    () => {},
  );
}

type CounterItem = { channelId: string; type: string; template: string };
async function wireCounters(guildId: string, memberId?: string, boostId?: string): Promise<void> {
  let cur: { enabled?: boolean; items?: CounterItem[] } = {};
  try {
    const raw = getGuildSettings(guildId).counters_config;
    if (raw) cur = JSON.parse(raw) as { enabled?: boolean; items?: CounterItem[] };
  } catch {
    /* pusty */
  }
  const items = Array.isArray(cur.items) ? cur.items : [];
  const have = new Set(items.map((i) => i.channelId));
  if (memberId && !have.has(memberId))
    items.push({ channelId: memberId, type: 'members', template: '👥 Członków: {count}' });
  if (boostId && !have.has(boostId))
    items.push({ channelId: boostId, type: 'boosts', template: '🚀 Boostów: {count}' });
  await cloudSetSetting(
    configWriteKey(guildId, 'counters_config'),
    JSON.stringify({ ...cur, enabled: true, items }),
  ).catch(() => {});
}

// Auto-wpinanie utworzonych kanałów w configi modułów („twórz + połącz").
async function autowire(guildId: string, log: LogItem[]): Promise<void> {
  const welcome = findId(log, 'Kanał: powitania');
  if (welcome) {
    await mergeConfig(guildId, 'welcome_config', { channelId: welcome, enabled: true });
    log.push({ label: 'Powiązano: powitania → moduł powitań', ok: true });
  }
  const logs = findId(log, 'Kanał: logi-serwera');
  if (logs) {
    await mergeConfig(guildId, 'logging_config', { channelId: logs, enabled: true });
    log.push({ label: 'Powiązano: logi → logi serwera', ok: true });
  }
  const mem = findId(log, 'Kanał: 📊 Członkowie');
  const boo = findId(log, 'Kanał: 🚀 Boosty');
  if (mem || boo) {
    await wireCounters(guildId, mem, boo);
    log.push({ label: 'Powiązano: liczniki → moduł liczników', ok: true });
  }
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const raw = await cloudGetSetting('setup_provision').catch(() => null);
  if (!raw) return;
  let plan: Plan;
  try {
    plan = JSON.parse(raw) as Plan;
  } catch {
    return;
  }
  if (!plan.id || plan.id === lastId) return;

  // Dedup po wyniku (przeżywa restart bota).
  const prev = await cloudGetSetting('setup_provision_result').catch(() => null);
  if (prev) {
    try {
      if ((JSON.parse(prev) as { id?: string }).id === plan.id) {
        lastId = plan.id;
        return;
      }
    } catch {
      /* zignoruj */
    }
  }

  lastId = plan.id;
  const guild = client.guilds.cache.first();
  if (!guild) return;
  const log = await execute(guild, plan).catch((e) => [
    { label: 'Provisioning', ok: false, detail: (e as Error).message },
  ]);
  await autowire(guild.id, log).catch(() => {});
  await cloudSetSetting(
    'setup_provision_result',
    JSON.stringify({ id: plan.id, done: true, log, ts: Date.now() }),
  ).catch(() => {});
  console.log(
    `[provision] wykonano zlecenie ${plan.id} (${log.filter((l) => l.ok).length}/${log.length} ok).`,
  );
}

export function startProvision(client: Client): void {
  if (!hasCloud()) {
    console.log('[provision] brak Supabase — architekt serwera wyłączony.');
    return;
  }
  setInterval(
    () => void tick(client).catch((e) => console.warn('[provision]', (e as Error).message)),
    4000,
  );
  console.log('[provision] architekt serwera aktywny (poll zleceń co 4 s).');
}
