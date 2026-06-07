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

export type RichMessage = {
  content: string;
  useEmbed: boolean;
  embed: RichEmbed;
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

export const EMPTY_RICH: RichMessage = {
  content: '',
  useEmbed: false,
  embed: { ...EMPTY_EMBED },
};

// Uzupełnia braki domyślnymi (po odczycie z settings, gdzie część pól może nie istnieć).
export function normalizeRich(p?: Partial<RichMessage> | null): RichMessage {
  if (!p) return { content: '', useEmbed: false, embed: { ...EMPTY_EMBED } };
  return {
    content: p.content ?? '',
    useEmbed: !!p.useEmbed,
    embed: { ...EMPTY_EMBED, ...(p.embed ?? {}), fields: p.embed?.fields ?? [] },
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
