// Tor 3 — Invite Tracker: kto kogo zaprosił (diff snapshotów zaproszeń), fejki (młode konta),
// odejścia, nagrody-role za progi. Config 'invites_config'; dane w Supabase 'invites'.
// Wymaga intencji GuildInvites + uprawnienia bota „Zarządzanie serwerem" (do odczytu zaproszeń).

import {
  type Client,
  Events,
  type Guild,
  type GuildMember,
  type PartialGuildMember,
  type TextChannel,
} from 'discord.js';
import { cloudInsert, cloudSelect, cloudUpdate, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { bumpQuest } from './quests.mts';

type Reward = { count: number; roleId: string };
type Cfg = { on: boolean; logChannelId: string; fakeMinAgeDays: number; rewards: Reward[] };
// Etap K — config per-serwer: świeży odczyt (nagrody mają roleId — per-serwer), fallback global.
function cfg(guildId: string): Cfg {
  const raw = getGuildSettings(guildId).invites_config;
  try {
    const c = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return {
      on: !!c.enabled,
      logChannelId: String(c.logChannelId || ''),
      fakeMinAgeDays: Number(c.fakeMinAgeDays) || 0,
      rewards: Array.isArray(c.rewards) ? (c.rewards as Reward[]) : [],
    };
  } catch {
    return { on: false, logChannelId: '', fakeMinAgeDays: 0, rewards: [] };
  }
}

// guildId → (kod → liczba użyć)
const cache = new Map<string, Map<string, number>>();
// Serwery z GOTOWYM baseline (#kategoria C): dopóki wstępny snapshot nie ukończy się dla serwera,
// `before` jest pusty i diff przypisałby PIERWSZE zaproszenie z uses>0 przypadkowej osobie. Bez
// gotowego baseline NIE atrybuujemy (źródło nieznane) — lepiej „nieznane" niż błędny kredyt/nagroda.
const baselineReady = new Set<string>();

// Które zaproszenie zyskało użycie między snapshotami (czyste/testowalne).
export function findUsedInvite(before: Map<string, number>, after: Map<string, number>): string {
  for (const [code, uses] of after) {
    if (uses > (before.get(code) ?? 0)) return code;
  }
  return '';
}

async function snapshot(guild: Guild): Promise<Map<string, number>> {
  const m = new Map<string, number>();
  try {
    const invites = await guild.invites.fetch();
    for (const inv of invites.values()) m.set(inv.code, inv.uses ?? 0);
  } catch {
    /* brak uprawnienia „Zarządzanie serwerem" — degradacja do „nieznane źródło" */
  }
  return m;
}

export function startInvites(client: Client): void {
  log.info('[invites] aktywny (config z panelu).');

  // wstępny snapshot (startInvites wołane już po ClientReady); baseline per serwer oznaczany jako
  // gotowy dopiero PO ukończeniu — do tego czasu dołączenia nie są atrybuowane (anty-błędny kredyt).
  void (async () => {
    for (const guild of client.guilds.cache.values()) {
      cache.set(guild.id, await snapshot(guild));
      baselineReady.add(guild.id);
    }
  })();

  client.on(Events.InviteCreate, (inv) => {
    if (!inv.guild) return;
    const m = cache.get(inv.guild.id) ?? new Map<string, number>();
    m.set(inv.code, inv.uses ?? 0);
    cache.set(inv.guild.id, m);
  });
  client.on(Events.InviteDelete, (inv) => {
    if (inv.guild) cache.get(inv.guild.id)?.delete(inv.code);
  });

  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    try {
      const c = cfg(member.guild.id);
      if (!c.on) return;
      const ready = baselineReady.has(member.guild.id);
      const before = cache.get(member.guild.id) ?? new Map<string, number>();
      const after = await snapshot(member.guild);
      cache.set(member.guild.id, after);
      baselineReady.add(member.guild.id); // od teraz cache jest wiarygodny

      // Atrybucja TYLKO gdy mieliśmy wiarygodny baseline — inaczej „nieznane źródło" (bez zgadywania).
      const usedCode = ready ? findUsedInvite(before, after) : '';
      let inviterId = '';
      if (usedCode) {
        const invites = await member.guild.invites.fetch().catch(() => null);
        inviterId = invites?.get(usedCode)?.inviter?.id ?? '';
      }

      const ageDays = (Date.now() - member.user.createdTimestamp) / 86_400_000;
      const fake = c.fakeMinAgeDays > 0 && ageDays < c.fakeMinAgeDays;

      if (hasCloud()) {
        await cloudInsert('invites', [
          {
            guild_id: member.guild.id,
            inviter_id: inviterId,
            invited_id: member.id,
            invited_name: member.user.username,
            code: usedCode,
            fake,
            has_left: false,
          },
        ]).catch((e) => log.warn('[invites]', { err: e }));
      }

      if (c.logChannelId) {
        const ch = await member.guild.channels.fetch(c.logChannelId).catch(() => null);
        if (ch?.isTextBased() && 'send' in ch) {
          const who = inviterId ? `<@${inviterId}>` : '*nieznane źródło*';
          await (ch as TextChannel)
            .send(
              `📥 <@${member.id}> dołączył(a) — zaproszenie od ${who}${fake ? ' ⚠️ *(podejrzane: młode konto)*' : ''}.`,
            )
            .catch(() => {});
        }
      }

      if (inviterId && !fake) bumpQuest(member.guild.id, inviterId, 'invites');

      // nagrody za realne zaproszenia
      if (inviterId && !fake && c.rewards.length && hasCloud()) {
        const rows = await cloudSelect<{ invited_id: string }>(
          'invites',
          `select=invited_id&guild_id=eq.${member.guild.id}&inviter_id=eq.${inviterId}&fake=eq.false&has_left=eq.false`,
        ).catch(() => [] as { invited_id: string }[]);
        const real = rows.length;
        const inviterMember = await member.guild.members.fetch(inviterId).catch(() => null);
        if (inviterMember) {
          for (const r of c.rewards) {
            if (real >= r.count && r.roleId && !inviterMember.roles.cache.has(r.roleId)) {
              await inviterMember.roles
                .add(r.roleId, `Nagroda za ${r.count} zaproszeń`)
                .catch(() => {});
            }
          }
        }
      }
    } catch (e) {
      log.warn('[invites]', { err: e });
    }
  });

  client.on(Events.GuildMemberRemove, async (member: GuildMember | PartialGuildMember) => {
    try {
      if (!cfg(member.guild.id).on || !hasCloud()) return;
      await cloudUpdate('invites', `guild_id=eq.${member.guild.id}&invited_id=eq.${member.id}`, {
        has_left: true,
      }).catch(() => {});
    } catch (e) {
      log.warn('[invites]', { err: e });
    }
  });
}
