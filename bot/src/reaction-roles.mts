// Reaction roles (Faza 4 + Faza 8 #5) — role za reakcje. Dwa tryby:
//  1) istniejąca wiadomość → wpisy 'reaction_roles' [{messageId,emoji,roleId}] (panel),
//  2) panel utworzony przez bota → 'reaction_role_panel' {pairs:[{emoji,roleId}]} + 'reaction_role_panel_msg' (id),
//     publikowany komendą /reactionpanel (embed z Message Studio + auto-reakcje).
// Wymaga intencji GuildMessageReactions + partials (reakcje na niecache'owanych wiadomościach).

import {
  type Client,
  Events,
  type MessageReaction,
  type PartialMessageReaction,
  type PartialUser,
  type User,
} from 'discord.js';
import { getGuildSettings } from './lib/db.mts';
import { log } from './lib/log.mts';

type RR = { messageId: string; emoji: string; roleId: string };
type Pair = { emoji: string; roleId: string };
type GuildRR = { rules: RR[]; panelPairs: Pair[]; panelExclusive: boolean; panelMsgId: string };

// Stan PER-SERWER (audyt C-1): wcześniej moduł trzymał JEDEN globalny zestaw z getSettings(), więc
// panel serwera B nadpisywał config serwera A (last-writer-wins) i matchRole nie był scope'owany.
// getGuildSettings robi override `g:<id>:*` → fallback global — serwer właściciela/empire (config
// pisany globalnie przez tor ghost-empire) czyta go dalej przez fallback, bez zmian w tamtym torze.
const byGuild = new Map<string, GuildRR>();

function loadGuild(guildId: string): GuildRR {
  const s = getGuildSettings(guildId);
  let rules: RR[] = [];
  try {
    const a = s.reaction_roles ? (JSON.parse(s.reaction_roles) as unknown) : [];
    rules = Array.isArray(a) ? (a as RR[]) : [];
  } catch {
    rules = [];
  }
  let panelPairs: Pair[] = [];
  let panelExclusive = false;
  try {
    const p = JSON.parse(s.reaction_role_panel || '{}') as { pairs?: Pair[]; exclusive?: boolean };
    panelPairs = Array.isArray(p.pairs) ? p.pairs : [];
    panelExclusive = p.exclusive === true;
  } catch {
    panelPairs = [];
    panelExclusive = false;
  }
  return { rules, panelPairs, panelExclusive, panelMsgId: s.reaction_role_panel_msg || '' };
}

// Odśwież stan JEDNEGO serwera (eksport dla testów + komendy /reactionpanel po zapisie).
export function refreshGuild(guildId: string): void {
  byGuild.set(guildId, loadGuild(guildId));
}

// Odśwież wszystkie serwery bota (poller).
export function refresh(client: Client): void {
  byGuild.clear();
  for (const g of client.guilds.cache.values()) byGuild.set(g.id, loadGuild(g.id));
}

export function emojiMatches(
  val: string,
  reaction: MessageReaction | PartialMessageReaction,
): boolean {
  const e = reaction.emoji;
  return val === e.name || val === e.id || val === e.toString();
}

export function matchRole(
  guildId: string,
  messageId: string,
  reaction: MessageReaction | PartialMessageReaction,
): string | undefined {
  const st = byGuild.get(guildId);
  if (!st) return undefined;
  const item = st.rules.find((r) => r.messageId === messageId && emojiMatches(r.emoji, reaction));
  if (item) return item.roleId;
  if (st.panelMsgId && messageId === st.panelMsgId) {
    const p = st.panelPairs.find((x) => emojiMatches(x.emoji, reaction));
    if (p) return p.roleId;
  }
  return undefined;
}

async function apply(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  add: boolean,
): Promise<void> {
  if (user.bot) return;
  try {
    if (reaction.partial) await reaction.fetch();
    const guild = reaction.message.guild;
    if (!guild) return;
    const st = byGuild.get(guild.id);
    if (!st) return;
    const roleId = matchRole(guild.id, reaction.message.id, reaction);
    if (!roleId) return;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;
    if (add) {
      await member.roles.add(roleId).catch(() => {});
      // Tryb „wybierz jedną" (exclusive) — zostaw tylko wybraną rolę z panelu, zdejmij resztę.
      if (st.panelExclusive && reaction.message.id === st.panelMsgId) {
        for (const p of st.panelPairs) {
          if (p.roleId === roleId) continue;
          if (member.roles.cache.has(p.roleId)) await member.roles.remove(p.roleId).catch(() => {});
          const other = reaction.message.reactions.cache.find((rr) => emojiMatches(p.emoji, rr));
          if (other) await other.users.remove(user.id).catch(() => {});
        }
      }
    } else {
      await member.roles.remove(roleId).catch(() => {});
    }
  } catch (e) {
    log.warn('[reaction-roles]', { err: e });
  }
}

export function startReactionRoles(client: Client): void {
  refresh(client);
  setInterval(() => refresh(client), 30_000);
  client.on(Events.MessageReactionAdd, (reaction, user) => void apply(reaction, user, true));
  client.on(Events.MessageReactionRemove, (reaction, user) => void apply(reaction, user, false));
  log.info('[reaction-roles] aktywny per-serwer (role za reakcje + panel; config z panelu).');
}
