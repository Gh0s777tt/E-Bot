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
// Components V2 (Etap I) — bloki nowego formatu wiadomości (flaga IS_COMPONENTS_V2 = 1<<15).
// Gdy useV2 i bloki mają treść, buildSendOptions zwraca components+flags zamiast content/embeds.
export type V2Block =
  | { kind: 'text'; text: string }
  | { kind: 'separator'; divider?: boolean; large?: boolean }
  | { kind: 'gallery'; urls: string[] }
  | { kind: 'section'; text: string; thumbnailUrl: string };
export type V2Spec = { accentColor?: string; blocks: V2Block[] };

export type RichMessage = {
  content?: string;
  useEmbed?: boolean;
  embed?: RichEmbed;
  useV2?: boolean;
  v2?: V2Spec;
};

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

export function v2HasContent(v2?: V2Spec | null): boolean {
  if (!v2?.blocks?.length) return false;
  return v2.blocks.some(
    (b) =>
      (b.kind === 'text' && b.text?.trim()) ||
      (b.kind === 'section' && b.text?.trim()) ||
      (b.kind === 'gallery' && b.urls?.some((u) => u?.trim())) ||
      b.kind === 'separator',
  );
}

export function hasRich(spec?: RichMessage | null): boolean {
  if (!spec) return false;
  if (spec.useV2 && v2HasContent(spec.v2)) return true;
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

// Surowe komponenty V2 (typy API: 9 Section, 10 TextDisplay, 11 Thumbnail, 12 MediaGallery,
// 14 Separator, 17 Container). discord.js v14 przyjmuje raw obiekty w `components`.
export function buildV2Components(spec: RichMessage, vars: Record<string, string> = {}): unknown[] {
  const v2 = spec.v2;
  if (!v2) return [];
  const items: unknown[] = [];
  for (const b of v2.blocks.slice(0, 10)) {
    if (b.kind === 'text' && b.text?.trim()) {
      items.push({ type: 10, content: sub(b.text, vars).slice(0, 4000) });
    } else if (b.kind === 'separator') {
      items.push({ type: 14, divider: b.divider !== false, spacing: b.large ? 2 : 1 });
    } else if (b.kind === 'gallery') {
      const urls = (b.urls ?? [])
        .map((u) => u.trim())
        .filter(Boolean)
        .slice(0, 10);
      if (urls.length) items.push({ type: 12, items: urls.map((url) => ({ media: { url } })) });
    } else if (b.kind === 'section' && b.text?.trim()) {
      items.push({
        type: 9,
        components: [{ type: 10, content: sub(b.text, vars).slice(0, 4000) }],
        ...(b.thumbnailUrl?.trim()
          ? { accessory: { type: 11, media: { url: b.thumbnailUrl.trim() } } }
          : {}),
      });
    }
  }
  const accent = hexToInt(v2.accentColor);
  if (accent !== undefined && items.length) {
    return [{ type: 17, accent_color: accent, components: items }];
  }
  return items;
}

export const FLAG_COMPONENTS_V2 = 1 << 15;

// Gotowe opcje do channel.send(): V2 (components + flaga, bez content/embeds — Discord ich
// wtedy zabrania) albo klasyka (content + embeds). Caller dokłada allowedMentions/files.
export function buildSendOptions(
  spec: RichMessage,
  vars: Record<string, string> = {},
): { content?: string; embeds?: APIEmbed[]; components?: unknown[]; flags?: number } {
  if (spec.useV2 && v2HasContent(spec.v2)) {
    const components = buildV2Components(spec, vars);
    if (components.length) return { components, flags: FLAG_COMPONENTS_V2 };
  }
  return buildRichMessage(spec, vars);
}
