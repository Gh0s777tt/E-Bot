// Trwałe role (sticky roles): gdy członek WYCHODZI, bot zapisuje jego role, a gdy WRACA — przywraca je.
// Anty-ucieczka od wyciszenia (leave→rejoin nie zdejmie roli „Muted/Wyciszony") + zachowanie zdobytych
// ról (poziomy, kolory). Snapshoty w 'g:<id>:sticky_snapshots' (settings JSON, bez tabeli). Config
// 'stickyroles_config' PER-SERWER {enabled, all, roles[]}. Wymaga chmury (snapshot musi przeżyć restart)
// oraz uprawnienia ManageRoles + odpowiedniej pozycji roli bota.
import {
  type Client,
  Events,
  type GuildMember,
  type PartialGuildMember,
  PermissionFlagsBits,
} from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean; all: boolean; roles: string[] };
const DEFAULT: Cfg = { enabled: false, all: false, roles: [] };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId).stickyroles_config, DEFAULT);
}

type Snap = { u: string; r: string[]; at: number };

// Czysta, testowalna: które role zapamiętać przy wyjściu. Pomija @everyone i role zarządzane
// (bot/integracja/boost — nieprzydzielalne ręcznie); przy all=false bierze tylko z listy `allow`.
export function pickPersistable(
  roles: { id: string; managed: boolean }[],
  everyoneId: string,
  all: boolean,
  allow: string[],
): string[] {
  return roles
    .filter((r) => r.id !== everyoneId && !r.managed && (all || allow.includes(r.id)))
    .map((r) => r.id);
}

async function loadSnaps(guildId: string): Promise<Snap[]> {
  try {
    return JSON.parse((await cloudGetSetting(`g:${guildId}:sticky_snapshots`)) || '[]') as Snap[];
  } catch {
    return [];
  }
}
async function saveSnaps(guildId: string, s: Snap[]): Promise<void> {
  await cloudSetSetting(`g:${guildId}:sticky_snapshots`, JSON.stringify(s.slice(-1000))).catch(
    () => {},
  );
}

export function startStickyRoles(client: Client): void {
  if (!hasCloud()) {
    log.info('[stickyroles] brak chmury — trwałe role wyłączone.');
    return;
  }

  // Wyjście: zapamiętaj role (jeśli są jakieś do utrwalenia). Dedup po userze, najnowszy snapshot wygrywa.
  client.on(Events.GuildMemberRemove, async (member: GuildMember | PartialGuildMember) => {
    try {
      const c = cfgFor(member.guild.id);
      if (!c.enabled) return;
      const roleObjs = [...member.roles.cache.values()].map((r) => ({
        id: r.id,
        managed: r.managed,
      }));
      const keep = pickPersistable(roleObjs, member.guild.id, c.all, c.roles);
      if (!keep.length) return;
      const snaps = await loadSnaps(member.guild.id);
      await saveSnaps(member.guild.id, [
        ...snaps.filter((x) => x.u !== member.id),
        { u: member.id, r: keep, at: Date.now() },
      ]);
    } catch (e) {
      log.warn('[stickyroles] remove', { err: e });
    }
  });

  // Powrót: przywróć zapamiętane role (które nadal istnieją, są przydzielalne i poniżej roli bota).
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    try {
      const c = cfgFor(member.guild.id);
      if (!c.enabled) return;
      const me = member.guild.members.me;
      if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) return;
      const snaps = await loadSnaps(member.guild.id);
      const snap = snaps.find((x) => x.u === member.id);
      if (!snap?.r.length) return;
      const botTop = me.roles.highest.position;
      const toAdd = snap.r.filter((id) => {
        const role = member.guild.roles.cache.get(id);
        return !!role && !role.managed && role.id !== member.guild.id && role.position < botTop;
      });
      if (toAdd.length)
        await member.roles.add(toAdd, 'Trwałe role — przywrócenie po powrocie').catch(() => {});
      // Skonsumuj snapshot (jednorazowo), by nie rósł w nieskończoność.
      await saveSnaps(
        member.guild.id,
        snaps.filter((x) => x.u !== member.id),
      );
    } catch (e) {
      log.warn('[stickyroles] add', { err: e });
    }
  });

  log.info(
    '[stickyroles] trwałe role aktywne (snapshot przy wyjściu, przywracanie przy powrocie; config z panelu).',
  );
}
