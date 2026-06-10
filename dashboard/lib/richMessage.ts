// Faza 8 — wspólny format „bogatej wiadomości" (treść + embed) dla Message Studio.
// Panel produkuje ten JSON (zapis w settings), bot renderuje przez bot/src/lib/richMessage.mts.
// Pola embeda spłaszczone (authorName/authorIcon…) — wygodne dla stanu formularza i Zod.

export type RichField = { name: string; value: string; inline: boolean };

export type RichEmbed = {
  title: string;
  url: string;
  description: string;
  color: string; // hex '#RRGGBB' lub ''
  authorName: string;
  authorIcon: string;
  authorUrl: string;
  thumbnailUrl: string;
  imageUrl: string;
  footerText: string;
  footerIcon: string;
  timestamp: boolean;
  fields: RichField[];
};

// Components V2 (Etap I) — nowy format wiadomości Discorda (flaga IS_COMPONENTS_V2):
// bloki zamiast content/embed. Tryb opcjonalny (useV2), włączany per formularz (allowV2).
export type V2Block =
  | { kind: 'text'; text: string }
  | { kind: 'separator'; divider: boolean; large: boolean }
  | { kind: 'gallery'; urls: string[] }
  | { kind: 'section'; text: string; thumbnailUrl: string };

export type V2Spec = {
  accentColor: string; // hex '#RRGGBB' (kontener z paskiem koloru) lub '' = bez kontenera
  blocks: V2Block[];
};

export type RichMessage = {
  content: string;
  useEmbed: boolean;
  embed: RichEmbed;
  useV2?: boolean;
  v2?: V2Spec;
};

// Limity Discorda (do liczników znaków w UI).
export const LIMITS = {
  content: 2000,
  title: 256,
  description: 4096,
  fieldName: 256,
  fieldValue: 1024,
  footer: 2048,
  author: 256,
  fields: 25,
  embedTotal: 6000,
} as const;

export const EMPTY_EMBED: RichEmbed = {
  title: '',
  url: '',
  description: '',
  color: '#E50914',
  authorName: '',
  authorIcon: '',
  authorUrl: '',
  thumbnailUrl: '',
  imageUrl: '',
  footerText: '',
  footerIcon: '',
  timestamp: false,
  fields: [],
};

export const EMPTY_V2: V2Spec = { accentColor: '', blocks: [] };

export const EMPTY_RICH: RichMessage = {
  content: '',
  useEmbed: false,
  embed: { ...EMPTY_EMBED },
  useV2: false,
  v2: { accentColor: '', blocks: [] },
};

// Limity V2 (Discord): max 4000 znaków tekstu łącznie, 10 komponentów top-level, galeria 1–10.
export const LIMITS_V2 = { blocks: 10, textTotal: 4000, galleryUrls: 10 } as const;

export function v2TextTotal(v2: V2Spec): number {
  return v2.blocks.reduce(
    (a, b) => a + (b.kind === 'text' || b.kind === 'section' ? b.text.length : 0),
    0,
  );
}

export function v2HasContent(v2?: V2Spec | null): boolean {
  if (!v2) return false;
  return v2.blocks.some(
    (b) =>
      (b.kind === 'text' && b.text.trim()) ||
      (b.kind === 'section' && b.text.trim()) ||
      (b.kind === 'gallery' && b.urls.some((u) => u.trim())) ||
      b.kind === 'separator',
  );
}

// Uzupełnia braki domyślnymi (po odczycie z settings, gdzie część pól może nie istnieć).
export function normalizeRich(p?: Partial<RichMessage> | null): RichMessage {
  if (!p)
    return {
      content: '',
      useEmbed: false,
      embed: { ...EMPTY_EMBED },
      useV2: false,
      v2: { ...EMPTY_V2, blocks: [] },
    };
  return {
    content: p.content ?? '',
    useEmbed: !!p.useEmbed,
    embed: { ...EMPTY_EMBED, ...(p.embed ?? {}), fields: p.embed?.fields ?? [] },
    useV2: !!p.useV2,
    v2: { accentColor: p.v2?.accentColor ?? '', blocks: p.v2?.blocks ?? [] },
  };
}

// Migracja: stara wiadomość-string → RichMessage (treść, bez embeda).
export function fromLegacy(message: string): RichMessage {
  return { content: message ?? '', useEmbed: false, embed: { ...EMPTY_EMBED } };
}

// Suma znaków embeda (limit Discorda = 6000 łącznie).
export function embedTotal(e: RichEmbed): number {
  return (
    e.title.length +
    e.description.length +
    e.authorName.length +
    e.footerText.length +
    e.fields.reduce((a, f) => a + f.name.length + f.value.length, 0)
  );
}

export function embedHasContent(e: RichEmbed): boolean {
  return !!(
    e.title ||
    e.description ||
    e.authorName ||
    e.footerText ||
    e.imageUrl ||
    e.thumbnailUrl ||
    e.fields.some((f) => f.name && f.value)
  );
}
