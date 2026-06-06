// Reaction roles (Faza 4) — config z panelu (settings 'reaction_roles', synchronizowane).
// Reakcja pod wskazaną wiadomością → nadanie roli; usunięcie reakcji → odebranie.
// Wymaga intencji GuildMessageReactions + partials (reakcje na niecache'owanych wiadomościach).
import {
  type Client,
  Events,
  type MessageReaction,
  type PartialMessageReaction,
  type PartialUser,
  type User,
} from "discord.js";
import { getSettings } from "./lib/db.mts";

type RR = { messageId: string; emoji: string; roleId: string };

let rules: RR[] = [];
function refresh(): void {
  const raw = getSettings()["reaction_roles"];
  if (!raw) {
    rules = [];
    return;
  }
  try {
    const a = JSON.parse(raw) as unknown;
    rules = Array.isArray(a) ? (a as RR[]) : [];
  } catch {
    rules = [];
  }
}

function matchRule(messageId: string, reaction: MessageReaction | PartialMessageReaction): RR | undefined {
  const e = reaction.emoji;
  return rules.find(
    (r) =>
      r.messageId === messageId &&
      (r.emoji === e.name || r.emoji === e.id || r.emoji === e.toString()),
  );
}

async function apply(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  add: boolean,
): Promise<void> {
  if (user.bot || !rules.length) return;
  try {
    if (reaction.partial) await reaction.fetch();
    const rule = matchRule(reaction.message.id, reaction);
    if (!rule) return;
    const guild = reaction.message.guild;
    if (!guild) return;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;
    if (add) await member.roles.add(rule.roleId).catch(() => {});
    else await member.roles.remove(rule.roleId).catch(() => {});
  } catch (e) {
    console.warn("[reaction-roles]", (e as Error).message);
  }
}

export function startReactionRoles(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  client.on(Events.MessageReactionAdd, (reaction, user) => void apply(reaction, user, true));
  client.on(Events.MessageReactionRemove, (reaction, user) => void apply(reaction, user, false));
  console.log("[reaction-roles] aktywny (role za reakcje; config z panelu).");
}
