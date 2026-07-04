// Discovery C1 (#681) — proaktywna diagnoza „wymaga uwagi" na Pulpicie. Problem z audytu: rzeczy psują
// się PO CICHU — bot offline, chmura odłączona, moduł wskazuje na skasowany kanał/rolę, moduł włączony
// bez dokończonej konfiguracji (pain P3: „włączyłem, a nic się nie dzieje"). Baner zbiera to w jedną
// listę z akcją „Napraw →" do właściwej strony. Rdzeń (detectHealthIssues) jest czysty i testowalny;
// getHealthIssues() tylko zbiera wejście (heartbeat + activeSource + GuildMeta + configi modułów).
// Fala 2 (#682) dokłada check uprawnień bota: getBotPermissions() liczy bitmapę z ról bota
// (/users/@me/guilds/{id}/member + /guilds/{id}/roles) i ostrzega TYLKO, gdy uprawnienia potrzebuje
// jakiś włączony moduł (zero szumu na serwerach, które danej funkcji nie używają).
import { getAutodeleteConfig, getLoggingConfig, getWelcomeConfig } from './community';
import { activeSource, getRawSetting } from './data';
import { getStarboard } from './engagement';
import { getTicketsConfig } from './faza4';
import { getGuildMeta, getPrimaryGuildId } from './guild';
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

// Uprawnienie wymagane przez moduły: ostrzegamy tylko, gdy jakiś zależny moduł jest włączony.
export type PermCheck = { bit: bigint; label: string; enabled: boolean };

export type HealthInput = {
  botOnline: boolean;
  cloudOn: boolean;
  guildOk: boolean; // GuildMeta.ok — bez świeżej listy kanałów/ról nie oceniamy (zero fałszywych alarmów)
  channelIds: ReadonlySet<string>;
  roleIds: ReadonlySet<string>;
  refs: ModuleRef[];
  needsConfig: number; // ile modułów „włączone, ale niedokończone" (getModuleHealth z B2)
  botPerms: bigint | null; // bitmapa uprawnień bota; null = nie udało się pobrać → nie oceniamy
  permChecks: PermCheck[];
};

const ADMIN = 1n << 3n; // Administrator implikuje wszystko

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
  if (inp.botPerms !== null && (inp.botPerms & ADMIN) === 0n) {
    for (const p of inp.permChecks) {
      if (p.enabled && (inp.botPerms & p.bit) === 0n) {
        out.push({
          id: `perm-missing-${p.bit.toString()}`,
          severity: 'warning',
          msgKey: 'ui.health.permMissing',
          module: p.label,
          href: '/diagnostics',
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

// Uprawnienia → moduły, które ich potrzebują (etykiety PL jak w kliencie Discorda; klucze z MODULES).
const PERM_DEPS: { bit: bigint; label: string; modules: string[] }[] = [
  { bit: 1n << 28n, label: 'Zarządzaj rolami', modules: ['welcome', 'verification', 'twitchSub'] },
  { bit: 1n << 4n, label: 'Zarządzaj kanałami', modules: ['tempvoice', 'tickets', 'counters'] },
  { bit: 1n << 13n, label: 'Zarządzaj wiadomościami', modules: ['automod'] },
  { bit: 1n << 2n, label: 'Banuj członków', modules: ['antiraid'] },
  { bit: 1n << 40n, label: 'Wyciszaj członków', modules: ['automod', 'antiraid'] },
];

// Bitmapa uprawnień bota na serwerze: suma uprawnień @everyone + ról bota
// (/users/@me/guilds/{id}/member + /guilds/{id}/roles). null = brak tokena/błąd → nie oceniamy.
export async function getBotPermissions(): Promise<bigint | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = await getPrimaryGuildId();
  if (!token || !guildId) return null;
  const dget = async <T>(path: string): Promise<T | null> => {
    const r = await fetch(`https://discord.com/api/v10${path}`, {
      headers: { Authorization: `Bot ${token}` },
      next: { revalidate: 60 },
    }).catch(() => null);
    return r?.ok ? ((await r.json()) as T) : null;
  };
  const [member, roles] = await Promise.all([
    dget<{ roles: string[] }>(`/users/@me/guilds/${guildId}/member`),
    dget<{ id: string; permissions: string }[]>(`/guilds/${guildId}/roles`),
  ]);
  if (!member || !roles) return null;
  const mine = new Set([guildId, ...member.roles]); // @everyone (id == guildId) + role bota
  let perms = 0n;
  for (const r of roles) {
    if (!mine.has(r.id)) continue;
    try {
      perms |= BigInt(r.permissions);
    } catch {
      /* niepoprawna bitmapa roli — pomiń */
    }
  }
  return perms;
}

// Zbiera wejście detektora z istniejących źródeł (fail-open: błąd zbierania = brak banera, nie 500).
export async function getHealthIssues(): Promise<HealthIssue[]> {
  try {
    const [
      meta,
      src,
      beatRaw,
      health,
      welcome,
      logging,
      starboard,
      tickets,
      autodelete,
      notifyCh,
      botPerms,
    ] = await Promise.all([
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
      getBotPermissions(),
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
      // Auto-czyszczenie nie jest w rejestrze MODULES (brak master-toggle) — aktywne, gdy są reguły.
      {
        id: 'autodelete',
        label: 'Auto-czyszczenie kanałów',
        href: '/engagement',
        enabled: autodelete.rules.length > 0,
        channels: autodelete.rules.map((r) => r.channelId),
        roles: [],
      },
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
      botPerms,
      permChecks: PERM_DEPS.map((p) => ({
        bit: p.bit,
        label: p.label,
        enabled: p.modules.some((k) => !!health[k]?.enabled),
      })),
    });
  } catch {
    return [];
  }
}
