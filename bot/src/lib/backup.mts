// Backup struktury serwera (role + kanały + uprawnienia) — Architekt/Security (Etap G).
// Snapshot w settings 'server_backup' (JSON, mirror do chmury). Restore jest ADDYTYWNY:
// odtwarza tylko BRAKUJĄCE role/kanały (dopasowanie po nazwie), niczego nie usuwa —
// bezpieczny do odbudowy po nuke'u, nie zrobi katastrofy na zdrowym serwerze.
import { ChannelType, type Guild, type GuildChannelCreateOptions } from 'discord.js';
import { getSettings, setSetting } from './db.mts';

type SnapRole = {
  name: string;
  color: number;
  hoist: boolean;
  mentionable: boolean;
  permissions: string; // bitfield jako string
};
type SnapOverwrite = { kind: 'role' | 'user'; ref: string; allow: string; deny: string }; // role: ref = nazwa ('@everyone' = rola domyślna), user: ref = ID
type SnapChannel = {
  name: string;
  type: number;
  parent: string | null; // nazwa kategorii
  topic?: string;
  nsfw?: boolean;
  rateLimit?: number;
  bitrate?: number;
  userLimit?: number;
  overwrites: SnapOverwrite[];
};
export type Snapshot = { at: number; roles: SnapRole[]; channels: SnapChannel[] };

const KEY = 'server_backup';
const TYPES = new Set<number>([
  ChannelType.GuildText,
  ChannelType.GuildVoice,
  ChannelType.GuildCategory,
  ChannelType.GuildAnnouncement,
]);

export function readBackup(): Snapshot | null {
  const raw = getSettings().server_backup;
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Partial<Snapshot>;
    if (!Array.isArray(s.roles) || !Array.isArray(s.channels) || !s.at) return null;
    return s as Snapshot;
  } catch {
    return null;
  }
}

export function captureGuild(guild: Guild): Snapshot {
  const roles: SnapRole[] = [...guild.roles.cache.values()]
    .filter((r) => !r.managed && r.id !== guild.id)
    .sort((a, b) => b.position - a.position)
    .slice(0, 100)
    .map((r) => ({
      name: r.name,
      color: r.color,
      hoist: r.hoist,
      mentionable: r.mentionable,
      permissions: r.permissions.bitfield.toString(),
    }));

  const all = [...guild.channels.cache.values()].filter((c) => TYPES.has(c.type));
  // Kategorie najpierw (restore tworzy rodziców przed dziećmi).
  all.sort((a, b) =>
    a.type === b.type
      ? ('position' in a ? a.position : 0) - ('position' in b ? b.position : 0)
      : a.type === ChannelType.GuildCategory
        ? -1
        : b.type === ChannelType.GuildCategory
          ? 1
          : 0,
  );
  const channels: SnapChannel[] = all.slice(0, 200).map((c) => {
    const overwrites: SnapOverwrite[] = [];
    if ('permissionOverwrites' in c) {
      for (const ow of c.permissionOverwrites.cache.values()) {
        if (ow.type === 0) {
          const role = guild.roles.cache.get(ow.id);
          if (!role) continue;
          overwrites.push({
            kind: 'role',
            ref: role.id === guild.id ? '@everyone' : role.name,
            allow: ow.allow.bitfield.toString(),
            deny: ow.deny.bitfield.toString(),
          });
        } else {
          overwrites.push({
            kind: 'user',
            ref: ow.id,
            allow: ow.allow.bitfield.toString(),
            deny: ow.deny.bitfield.toString(),
          });
        }
      }
    }
    return {
      name: c.name,
      type: c.type,
      parent: c.parent?.name ?? null,
      topic: 'topic' in c && c.topic ? c.topic : undefined,
      nsfw: 'nsfw' in c && c.nsfw ? true : undefined,
      rateLimit:
        'rateLimitPerUser' in c && c.rateLimitPerUser ? (c.rateLimitPerUser as number) : undefined,
      bitrate: 'bitrate' in c && c.bitrate ? (c.bitrate as number) : undefined,
      userLimit: 'userLimit' in c && c.userLimit ? (c.userLimit as number) : undefined,
      overwrites,
    };
  });

  return { at: Date.now(), roles, channels };
}

export function saveBackup(snap: Snapshot): void {
  setSetting(KEY, JSON.stringify(snap));
}

// Addytywny restore — zwraca liczbę utworzonych ról i kanałów. Pomija istniejące (po nazwie;
// kanały dopasowywane w obrębie tej samej kategorii).
export async function restoreGuild(
  guild: Guild,
  snap: Snapshot,
): Promise<{ roles: number; channels: number }> {
  let createdRoles = 0;
  let createdChannels = 0;

  // 1) Role (bez @everyone/managed — tych nie snapshotujemy).
  const roleByName = new Map<string, string>();
  for (const r of guild.roles.cache.values()) roleByName.set(r.name, r.id);
  for (const sr of snap.roles) {
    if (roleByName.has(sr.name)) continue;
    const created = await guild.roles
      .create({
        name: sr.name,
        color: sr.color,
        hoist: sr.hoist,
        mentionable: sr.mentionable,
        permissions: BigInt(sr.permissions),
      })
      .catch(() => null);
    if (created) {
      roleByName.set(sr.name, created.id);
      createdRoles++;
    }
  }

  const resolveOverwrites = (
    list: SnapOverwrite[],
  ): { id: string; allow: bigint; deny: bigint }[] => {
    const out: { id: string; allow: bigint; deny: bigint }[] = [];
    for (const ow of list) {
      const id =
        ow.kind === 'user' ? ow.ref : ow.ref === '@everyone' ? guild.id : roleByName.get(ow.ref);
      if (!id) continue;
      out.push({ id, allow: BigInt(ow.allow), deny: BigInt(ow.deny) });
    }
    return out;
  };

  // 2) Kategorie (rodzice przed dziećmi — snapshot ma je na początku listy).
  const catByName = new Map<string, string>();
  for (const c of guild.channels.cache.values()) {
    if (c.type === ChannelType.GuildCategory) catByName.set(c.name, c.id);
  }
  for (const sc of snap.channels) {
    if (sc.type !== ChannelType.GuildCategory) continue;
    if (catByName.has(sc.name)) continue;
    const created = await guild.channels
      .create({
        name: sc.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: resolveOverwrites(sc.overwrites),
      })
      .catch(() => null);
    if (created) {
      catByName.set(sc.name, created.id);
      createdChannels++;
    }
  }

  // 3) Pozostałe kanały — pomiń istniejące o tej samej nazwie w tej samej kategorii.
  const exists = (name: string, parent: string | null): boolean =>
    guild.channels.cache.some(
      (c) =>
        c.type !== ChannelType.GuildCategory &&
        c.name === name &&
        (c.parent?.name ?? null) === parent,
    );
  for (const sc of snap.channels) {
    if (sc.type === ChannelType.GuildCategory) continue;
    if (exists(sc.name, sc.parent)) continue;
    const opts: GuildChannelCreateOptions = {
      name: sc.name,
      type: sc.type as GuildChannelCreateOptions['type'],
      parent: sc.parent ? (catByName.get(sc.parent) ?? undefined) : undefined,
      topic: sc.topic,
      nsfw: sc.nsfw,
      rateLimitPerUser: sc.rateLimit,
      bitrate: sc.bitrate,
      userLimit: sc.userLimit,
      permissionOverwrites: resolveOverwrites(sc.overwrites),
    };
    const created = await guild.channels.create(opts).catch(() => null);
    if (created) createdChannels++;
  }

  return { roles: createdRoles, channels: createdChannels };
}
