// Etap I — role z obecności (Presence): 🔴 live-rola dla streamujących (activity Streaming)
// i 🟣 vanity-rola za frazę/link w statusie niestandardowym. Configi w settings
// 'liverole_config' / 'vanityrole_config'; sterowane /liverole i /vanityrole.
// WYMAGA Presence Intent: przełącznik w Dev Portal + env PRESENCE_INTENT=1 (index.mts dodaje
// intent warunkowo — bez przełącznika w portalu bot nie zalogowałby się wcale). Bez env: no-op.

import { ActivityType, type Client, Events, type GuildMember, type Presence } from 'discord.js';
import { getSettings, setSetting } from '../lib/db.mts';
import { log } from '../lib/log.mts';

export type LiveRoleConfig = { enabled: boolean; roleId: string; requireRoleId: string };
export type VanityRoleConfig = { enabled: boolean; roleId: string; phrase: string };

let live: LiveRoleConfig = { enabled: false, roleId: '', requireRoleId: '' };
let vanity: VanityRoleConfig = { enabled: false, roleId: '', phrase: '' };

export function hasPresenceIntent(): boolean {
  return !!process.env.PRESENCE_INTENT;
}

function refresh(): void {
  const s = getSettings();
  try {
    if (s.liverole_config) live = { ...live, ...(JSON.parse(s.liverole_config) as object) };
  } catch {
    /* zostaw */
  }
  try {
    if (s.vanityrole_config) vanity = { ...vanity, ...(JSON.parse(s.vanityrole_config) as object) };
  } catch {
    /* zostaw */
  }
}

export function getLiveRoleConfig(): LiveRoleConfig {
  refresh();
  return { ...live };
}
export function getVanityRoleConfig(): VanityRoleConfig {
  refresh();
  return { ...vanity };
}
export function setLiveRole(cfg: LiveRoleConfig): void {
  live = cfg;
  setSetting('liverole_config', JSON.stringify(cfg));
}
export function setVanityRole(cfg: VanityRoleConfig): void {
  vanity = cfg;
  setSetting('vanityrole_config', JSON.stringify(cfg));
}

async function setRole(member: GuildMember, roleId: string, want: boolean): Promise<void> {
  const has = member.roles.cache.has(roleId);
  if (want === has) return;
  if (want) await member.roles.add(roleId, 'presence-role (live/vanity)').catch(() => {});
  else await member.roles.remove(roleId, 'presence-role (live/vanity)').catch(() => {});
}

async function applyLive(member: GuildMember, p: Presence): Promise<void> {
  if (!live.enabled || !live.roleId) return;
  let streaming = p.activities.some((a) => a.type === ActivityType.Streaming);
  if (streaming && live.requireRoleId && !member.roles.cache.has(live.requireRoleId)) {
    streaming = false; // filtr: live-rola tylko dla posiadaczy wskazanej roli
  }
  await setRole(member, live.roleId, streaming);
}

async function applyVanity(member: GuildMember, p: Presence): Promise<void> {
  if (!vanity.enabled || !vanity.roleId || !vanity.phrase) return;
  const custom = p.activities.find((a) => a.type === ActivityType.Custom);
  const match = (custom?.state ?? '').toLowerCase().includes(vanity.phrase.toLowerCase());
  await setRole(member, vanity.roleId, match);
}

export function startPresenceRoles(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  if (!hasPresenceIntent()) {
    log.info(
      '[presence-roles] uśpione — włącz Presence Intent w Dev Portal i ustaw PRESENCE_INTENT=1.',
    );
    return;
  }

  client.on(Events.PresenceUpdate, async (_old, p) => {
    const member = p.member;
    if (!member || member.user.bot || !p.guild) return;
    await applyLive(member, p);
    await applyVanity(member, p);
  });

  // Sweep startowy po cache (bez fetchu wszystkich członków) — łapie osoby już streamujące.
  setTimeout(() => {
    if (!live.enabled && !vanity.enabled) return;
    for (const guild of client.guilds.cache.values()) {
      for (const member of guild.members.cache.values()) {
        if (member.user.bot || !member.presence) continue;
        void applyLive(member, member.presence);
        void applyVanity(member, member.presence);
      }
    }
  }, 60_000);

  log.info('[presence-roles] aktywne (live-rola + vanity-rola; /liverole /vanityrole).');
}
