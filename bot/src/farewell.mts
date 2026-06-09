// Pożegnania (goodbye, na wyjście) + podziękowania za boost (booster, na start boostu).
// Config z /farewell → settings: goodbye_config / booster_config = JSON { enabled, channelId, message }.
// Zmienne w treści: {user} {username} {server} {memberCount}. Cache odświeżany co 30 s.
import {
  type Client,
  EmbedBuilder,
  Events,
  type GuildMember,
  type PartialGuildMember,
} from 'discord.js';
import { getSettings } from './lib/db.mts';

export const FAREWELL_ACCENT = 0xe50914; // czerwień marki (goodbye)
export const FAREWELL_BOOST = 0xf47fff; // róż boostu (booster)

export type FarewellConfig = { enabled: boolean; channelId: string; message: string };
const EMPTY: FarewellConfig = { enabled: false, channelId: '', message: '' };

let goodbye: FarewellConfig = { ...EMPTY };
let booster: FarewellConfig = { ...EMPTY };

function loadOne(key: string): FarewellConfig {
  const raw = getSettings()[key];
  if (!raw) return { ...EMPTY };
  try {
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<FarewellConfig>) };
  } catch {
    return { ...EMPTY };
  }
}

function refresh(): void {
  goodbye = loadOne('goodbye_config');
  booster = loadOne('booster_config');
}

// Podstawia zmienne {x} w szablonie. Eksport — używane też przez /farewell ... test.
export function renderVars(text: string, vars: Record<string, string>): string {
  let out = text;
  for (const [k, v] of Object.entries(vars)) out = out.split(k).join(v);
  return out;
}

export function memberVars(member: GuildMember | PartialGuildMember): Record<string, string> {
  return {
    '{user}': `<@${member.id}>`,
    '{username}': member.user?.username ?? 'user',
    '{server}': member.guild.name,
    '{memberCount}': String(member.guild.memberCount),
  };
}

export function farewellEmbed(content: string, color: number, thumbUrl?: string): EmbedBuilder {
  const e = new EmbedBuilder().setColor(color).setDescription(content);
  if (thumbUrl) e.setThumbnail(thumbUrl);
  return e;
}

async function send(
  member: GuildMember | PartialGuildMember,
  cfg: FarewellConfig,
  color: number,
): Promise<void> {
  if (!cfg.enabled || !cfg.channelId || !cfg.message) return;
  try {
    const ch = await member.guild.channels.fetch(cfg.channelId).catch(() => null);
    if (!ch?.isTextBased() || !('send' in ch)) return;
    const text = renderVars(cfg.message, memberVars(member));
    const embed = farewellEmbed(text, color, member.user?.displayAvatarURL());
    await ch.send({ embeds: [embed] }).catch(() => {});
  } catch (e) {
    console.warn('[farewell]', (e as Error).message);
  }
}

export function startFarewell(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);

  // Pożegnanie — gdy ktoś opuszcza serwer.
  client.on(Events.GuildMemberRemove, async (member) => {
    await send(member, goodbye, FAREWELL_ACCENT);
  });

  // Boost — wykryj start boostowania (premiumSince: brak → jest). Pomijamy partiale starego
  // stanu, by nie generować fałszywych podziękowań przy niepełnym cache.
  client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    if (oldMember.partial) return;
    if (!oldMember.premiumSinceTimestamp && newMember.premiumSinceTimestamp) {
      await send(newMember, booster, FAREWELL_BOOST);
    }
  });

  console.log('[farewell] aktywny (pożegnania + podziękowania za boost; config z /farewell).');
}
