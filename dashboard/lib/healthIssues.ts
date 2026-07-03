// Discovery C1 (#681) — proaktywna diagnoza „wymaga uwagi" na Pulpicie. Problem z audytu: rzeczy psują
// się PO CICHU — bot offline, chmura odłączona, moduł wskazuje na skasowany kanał/rolę, moduł włączony
// bez dokończonej konfiguracji (pain P3: „włączyłem, a nic się nie dzieje"). Baner zbiera to w jedną
// listę z akcją „Napraw →" do właściwej strony. Rdzeń (detectHealthIssues) jest czysty i testowalny;
// getHealthIssues() tylko zbiera wejście (heartbeat + activeSource + GuildMeta + configi modułów).
// Fala 1 świadomie BEZ checku uprawnień bota — panel nie zna bitmapy uprawnień (GuildMeta ma tylko
// id/name/position ról); wymaga rozszerzenia getGuildMeta o /guilds/{id}/members/@me (fala 2).
import { getAutodeleteConfig, getLoggingConfig, getWelcomeConfig } from './community';
import { activeSource, getRawSetting } from './data';
import { getStarboard } from './engagement';
import { getTicketsConfig } from './faza4';
import { getGuildMeta } from './guild';
import { getModuleHealth } from './moduleState';
import { MODULES } from './modules';

export type HealthIssue = {
  id: string;
  severity: 'error' | 'warning' | 'info';
  msgKey: string; // klucz i18n ui.health.* ({module}/{n} podstawia komponent)
  module?: string; // etykieta modułu do {module} (etykiety MODULES — jak w kokpicie /modules)
  n?: number; // liczba do {n}
  href: string; // cel „Napraw →"
};

// Odwołania modułu do bytów Discorda; puste ID są pomijane (to „wymaga konfiguracji", nie „usunięte").
export type ModuleRef = {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  channels: string[];
  roles: string[];
};

export type HealthInput = {
  botOnline: boolean;
  cloudOn: boolean;
  guildOk: boolean; // GuildMeta.ok — bez świeżej listy kanałów/ról nie oceniamy (zero fałszywych alarmów)
  channelIds: ReadonlySet<string>;
  roleIds: ReadonlySet<string>;
  refs: ModuleRef[];
  needsConfig: number; // ile modułów „włączone, ale niedokończone" (getModuleHealth z B2)
};

const RANK = { error: 0, warning: 1, info: 2 } as const;

// Czysty detektor: wejście → posortowana lista problemów (błędy najpierw).
export function detectHealthIssues(inp: HealthInput): HealthIssue[] {
  const out: HealthIssue[] = [];
  if (!inp.botOnline) {
    out.push({
      id: 'bot-offline',
      severity: 'error',
      msgKey: 'ui.health.botOffline',
      href: '/diagnostics',
    });
  }
  if (!inp.cloudOn) {
    out.push({
      id: 'cloud-off',
      severity: 'error',
      msgKey: 'ui.health.cloudOff',
      href: '/diagnostics',
    });
  }
  if (inp.guildOk) {
    for (const r of inp.refs) {
      if (!r.enabled) continue;
      if (r.channels.some((id) => id && !inp.channelIds.has(id))) {
        out.push({
          id: `${r.id}-channel-missing`,
          severity: 'warning',
          msgKey: 'ui.health.channelMissing',
          module: r.label,
          href: r.href,
        });
      }
      if (r.roles.some((id) => id && !inp.roleIds.has(id))) {
        out.push({
          id: `${r.id}-role-missing`,
          severity: 'warning',
          msgKey: 'ui.health.roleMissing',
          module: r.label,
          href: r.href,
        });
      }
    }
  }
  if (inp.needsConfig > 0) {
    out.push({
      id: 'needs-config',
      severity: 'info',
      msgKey: 'ui.health.needsConfig',
      n: inp.needsConfig,
      href: '/modules',
    });
  }
  return out.sort((a, b) => RANK[a.severity] - RANK[b.severity]);
}

// Świeżość heartbeatu jak w /diagnostics i Topbar: online + ts młodszy niż 120 s.
export function parseBotOnline(raw: string | null, now: number): boolean {
  if (!raw) return false;
  try {
    const d = JSON.parse(raw) as { online?: boolean; ts?: number };
    return !!d.online && typeof d.ts === 'number' && now - d.ts < 120_000;
  } catch {
    return false;
  }
}

const mod = (key: string) => MODULES.find((m) => m.key === key);
const LIVE_KEYS = ['notifyTwitch', 'notifyKick', 'notifyRumble', 'notifyYoutube'];

// Zbiera wejście detektora z istniejących źródeł (fail-open: błąd zbierania = brak banera, nie 500).
export async function getHealthIssues(): Promise<HealthIssue[]> {
  try {
    const [meta, src, beatRaw, health, welcome, logging, starboard, tickets, autodelete, notifyCh] =
      await Promise.all([
        getGuildMeta(),
        activeSource(),
        getRawSetting('bot_status'),
        getModuleHealth(),
        getWelcomeConfig(),
        getLoggingConfig(),
        getStarboard(),
        getTicketsConfig(),
        getAutodeleteConfig(),
        getRawSetting('notify_channel_id'),
      ]);
    const ref = (key: string, channels: string[], roles: string[] = []): ModuleRef => ({
      id: key,
      label: mod(key)?.label ?? key,
      href: mod(key)?.href ?? '/modules',
      enabled: !!health[key]?.enabled,
      channels,
      roles,
    });
    const refs: ModuleRef[] = [
      ref('welcome', [welcome.channelId], [welcome.autoroleId]),
      ref('logging', [logging.channelId]),
      ref('starboard', [starboard.channelId]),
      ref('tickets', [tickets.categoryId, tickets.logChannelId], [tickets.supportRoleId]),
      ref(
        'autodelete',
        autodelete.rules.map((r) => r.channelId),
      ),
      // Powiadomienia live: wspólny kanał 4 przełączników platform — aktywny, gdy dowolny włączony.
      {
        id: 'live',
        label: 'Powiadomienia live',
        href: mod('notifyTwitch')?.href ?? '/live',
        enabled: LIVE_KEYS.some((k) => !!health[k]?.enabled),
        channels: [notifyCh ?? ''],
        roles: [],
      },
    ];
    return detectHealthIssues({
      botOnline: parseBotOnline(beatRaw, Date.now()),
      cloudOn: src !== 'none',
      guildOk: meta.ok,
      channelIds: new Set(meta.channels.map((c) => c.id)),
      roleIds: new Set(meta.roles.map((r) => r.id)),
      refs,
      needsConfig: Object.values(health).filter((h) => h.enabled && !h.configured).length,
    });
  } catch {
    return [];
  }
}
