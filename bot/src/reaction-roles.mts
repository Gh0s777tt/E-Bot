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
import { getSettings } from './lib/db.mts';
import { log } from './lib/log.mts';

type RR = { messageId: string; emoji: string; roleId: string };
type Pair = { emoji: string; roleId: string };

let rules: RR[] = [];
let panelPairs: Pair[] = [];
let panelExclusive = false;
let panelMsgId = '';

function refresh(): void {
  const raw = getSettings()['reaction_roles'];
  try {
    const a = raw ? (JSON.parse(raw) as unknown) : [];
    rules = Array.isArray(a) ? (a as RR[]) : [];
  } catch {
    rules = [];
  }
  try {
    const p = JSON.parse(getSettings()['reaction_role_panel'] || '{}') as {
      pairs?: Pair[];
      exclusive?: boolean;
    };
    panelPairs = Array.isArray(p.pairs) ? p.pairs : [];
    panelExclusive = p.exclusive === true;
  } catch {
    panelPairs = [];
    panelExclusive = false;
  }
  panelMsgId = getSettings()['reaction_role_panel_msg'] || '';
}

function emojiMatches(val: string, reaction: MessageReaction | PartialMessageReaction): boolean {
  const e = reaction.emoji;
  return val === e.name || val === e.id || val === e.toString();
}

function matchRole(
  messageId: string,
  reaction: MessageReaction | PartialMessageReaction,
): string | undefined {
  const item = rules.find((r) => r.messageId === messageId && emojiMatches(r.emoji, reaction));
  if (item) return item.roleId;
  if (panelMsgId && messageId === panelMsgId) {
    const p = panelPairs.find((x) => emojiMatches(x.emoji, reaction));
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
    const roleId = matchRole(reaction.message.id, reaction);
    if (!roleId) return;
    const guild = reaction.message.guild;
    if (!guild) return;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;
    if (add) {
      await member.roles.add(roleId).catch(() => {});
      // Tryb „wybierz jedną" (exclusive) — zostaw tylko wybraną rolę z panelu, zdejmij resztę.
      if (panelExclusive && reaction.message.id === panelMsgId) {
        for (const p of panelPairs) {
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
  refresh();
  setInterval(refresh, 30_000);
  client.on(Events.MessageReactionAdd, (reaction, user) => void apply(reaction, user, true));
  client.on(Events.MessageReactionRemove, (reaction, user) => void apply(reaction, user, false));
  log.info('[reaction-roles] aktywny (role za reakcje + panel; config z panelu).');
}
