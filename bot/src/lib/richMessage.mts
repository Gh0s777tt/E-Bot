// Faza 8 — renderer „bogatej wiadomości" (Message Studio) → payload discord.js.
// Wspólny format z panelem (dashboard/lib/richMessage.ts): treść + opcjonalny embed.
// Wstecznie zgodny: gdy spec pusty, caller używa starej ścieżki (message: string).
import type { APIEmbed } from 'discord.js';

export type RichField = { name: string; value: string; inline?: boolean };
export type RichEmbed = {
  title?: string;
  url?: string;
  description?: string;
  color?: string;
  authorName?: string;
  authorIcon?: string;
  authorUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  footerText?: string;
  footerIcon?: string;
  timestamp?: boolean;
  fields?: RichField[];
};
export type RichMessage = { content?: string; useEmbed?: boolean; embed?: RichEmbed };

function hexToInt(hex?: string): number | undefined {
  if (!hex) return undefined;
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m?.[1]) return undefined;
  return Number.parseInt(m[1], 16);
}

function sub(s: string | undefined, vars: Record<string, string>): string {
  let out = s ?? '';
  for (const [k, v] of Object.entries(vars)) out = out.split(k).join(v);
  return out;
}

export function embedHasContent(e?: RichEmbed): boolean {
  if (!e) return false;
  return !!(
    e.title ||
    e.description ||
    e.authorName ||
    e.footerText ||
    e.imageUrl ||
    e.thumbnailUrl ||
    e.fields?.some((f) => f.name && f.value)
  );
}

export function hasRich(spec?: RichMessage | null): boolean {
  if (!spec) return false;
  if (spec.content?.trim()) return true;
  return !!spec.useEmbed && embedHasContent(spec.embed);
}

export function buildEmbed(e: RichEmbed, vars: Record<string, string>): APIEmbed {
  const api: APIEmbed = {};
  if (e.title) api.title = sub(e.title, vars).slice(0, 256);
  if (e.url) api.url = e.url;
  if (e.description) api.description = sub(e.description, vars).slice(0, 4096);
  const color = hexToInt(e.color);
  if (color !== undefined) api.color = color;
  if (e.authorName)
    api.author = {
      name: sub(e.authorName, vars).slice(0, 256),
      icon_url: e.authorIcon || undefined,
      url: e.authorUrl || undefined,
    };
  if (e.footerText)
    api.footer = {
      text: sub(e.footerText, vars).slice(0, 2048),
      icon_url: e.footerIcon || undefined,
    };
  if (e.thumbnailUrl) api.thumbnail = { url: e.thumbnailUrl };
  if (e.imageUrl) api.image = { url: e.imageUrl };
  if (e.timestamp) api.timestamp = new Date().toISOString();
  const fields = (e.fields ?? [])
    .filter((f) => f.name && f.value)
    .slice(0, 25)
    .map((f) => ({
      name: sub(f.name, vars).slice(0, 256),
      value: sub(f.value, vars).slice(0, 1024),
      inline: !!f.inline,
    }));
  if (fields.length) api.fields = fields;
  return api;
}

// Treść + (opcjonalnie) embed. Caller dokłada files/ping wedle potrzeby.
export function buildRichMessage(
  spec: RichMessage,
  vars: Record<string, string> = {},
): { content?: string; embeds: APIEmbed[] } {
  const content = sub(spec.content, vars).slice(0, 2000) || undefined;
  const embeds =
    spec.useEmbed && spec.embed && embedHasContent(spec.embed)
      ? [buildEmbed(spec.embed, vars)]
      : [];
  return { content, embeds };
}
