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

type RR = { messageId: string; emoji: string; roleId: string };
type Pair = { emoji: string; roleId: string };

let rules: RR[] = [];
let panelPairs: Pair[] = [];
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
    const p = JSON.parse(getSettings()['reaction_role_panel'] || '{}') as { pairs?: Pair[] };
    panelPairs = Array.isArray(p.pairs) ? p.pairs : [];
  } catch {
    panelPairs = [];
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
    if (add) await member.roles.add(roleId).catch(() => {});
    else await member.roles.remove(roleId).catch(() => {});
  } catch (e) {
    console.warn('[reaction-roles]', (e as Error).message);
  }
}

export function startReactionRoles(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  client.on(Events.MessageReactionAdd, (reaction, user) => void apply(reaction, user, true));
  client.on(Events.MessageReactionRemove, (reaction, user) => void apply(reaction, user, false));
  console.log('[reaction-roles] aktywny (role za reakcje + panel; config z panelu).');
}
