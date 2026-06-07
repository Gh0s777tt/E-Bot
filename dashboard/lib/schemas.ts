// Walidacja runtime wejść API przez Zod — twardy kontrakt zamiast `as T`.
import { z } from 'zod';

// ── Presence bota (POST /api/bot/presence) ─────────────────
export const presenceSchema = z.object({
  status: z.enum(['online', 'idle', 'dnd', 'invisible']).default('online'),
  type: z
    .enum(['none', 'playing', 'streaming', 'listening', 'watching', 'competing', 'custom'])
    .default('none'),
  text: z.string().max(128).default(''),
  url: z.string().max(200).default(''),
});
export type PresenceInput = z.infer<typeof presenceSchema>;

// ── Profil bota (PATCH /api/bot/profile) ───────────────────
export const botProfileSchema = z
  .object({
    username: z.string().trim().min(1).max(32).optional(),
    avatarDataUri: z.string().startsWith('data:image/').max(2_000_000).optional(),
  })
  .refine((d) => d.username || d.avatarDataUri, { message: 'Nic do zmiany' });
export type BotProfileInput = z.infer<typeof botProfileSchema>;

// ── Konfiguracja Anti-Nuke (POST /api/antinuke) ────────────
const protectionSchema = z.object({
  enabled: z.boolean(),
  count: z.number().int().min(1).max(1000),
  windowSec: z.number().int().min(1).max(86_400),
});
export const antinukeSchema = z.object({
  enabled: z.boolean(),
  logChannelId: z.string().max(40),
  punishment: z.enum(['ban', 'kick', 'timeout', 'strip', 'quarantine']),
  quarantineRoleId: z.string().max(40),
  whitelistUsers: z.array(z.string().max(40)).max(500),
  whitelistRoles: z.array(z.string().max(40)).max(500),
  protections: z.record(z.string(), protectionSchema),
});
export type AntinukeInput = z.infer<typeof antinukeSchema>;

// ── Leveling (POST /api/leveling) ──────────────────────────
export const levelRewardSchema = z.object({
  level: z.number().int().min(1).max(1000),
  roleId: z.string().max(40),
});
export const levelingSchema = z.object({
  enabled: z.boolean(),
  xpPerMessage: z.number().int().min(0).max(1000),
  xpPerVoiceMin: z.number().int().min(0).max(1000),
  cooldownSec: z.number().int().min(0).max(3600),
  announceChannelId: z.string().max(40),
  rewards: z.array(levelRewardSchema).max(100),
  weekendBonus: z.number().min(1).max(10),
  multipliers: z
    .array(z.object({ roleId: z.string().max(40), factor: z.number().min(1).max(10) }))
    .max(50),
  noXpChannels: z.array(z.string().max(40)).max(100),
  noXpRoles: z.array(z.string().max(40)).max(100),
  voiceAntiAfk: z.boolean(),
  stackRewards: z.boolean(),
  levelUpMessage: z.string().max(1000),
  prestigeEnabled: z.boolean(),
  prestigeLevel: z.number().int().min(1).max(1000),
  prestigeRoleId: z.string().max(40),
});
export type LevelingInput = z.infer<typeof levelingSchema>;

// ── Tickety (POST /api/tickets) ────────────────────────────
export const ticketsConfigSchema = z.object({
  enabled: z.boolean(),
  categoryId: z.string().max(40),
  supportRoleId: z.string().max(40),
  welcome: z.string().max(500),
  logChannelId: z.string().max(40),
  panelMessage: z.string().max(1000).optional().default('Masz sprawę? Otwórz ticket. 🎟️'),
  ratingEnabled: z.boolean().optional().default(true),
});
export type TicketsConfigInput = z.infer<typeof ticketsConfigSchema>;

// ── Komendy AI (POST /api/ai-config) ───────────────────────
export const aiConfigSchema = z.object({
  enabled: z.boolean(),
  model: z.enum(['deepseek', 'openai']),
  dailyRequestLimit: z.number().int().min(0).max(10_000),
  dailyTokenLimit: z.number().int().min(0).max(10_000_000),
});
export type AiConfigInput = z.infer<typeof aiConfigSchema>;

// ── Reaction roles (POST /api/reaction-roles) ──────────────
export const reactionRolesSchema = z.object({
  items: z
    .array(
      z.object({
        messageId: z.string().max(40),
        emoji: z.string().min(1).max(100),
        roleId: z.string().max(40),
      }),
    )
    .max(100),
});
export type ReactionRolesInput = z.infer<typeof reactionRolesSchema>;

// ── Ekonomia serwera (Faza 7/F3) ───────────────────────────
export const economySchema = z.object({
  enabled: z.boolean(),
  currency: z.string().min(1).max(40),
  startBalance: z.number().int().min(0).max(1_000_000),
  dailyAmount: z.number().int().min(0).max(1_000_000),
  dailyStreakBonus: z.number().int().min(0).max(100_000),
  workMin: z.number().int().min(0).max(1_000_000),
  workMax: z.number().int().min(0).max(1_000_000),
  workCooldownMin: z.number().int().min(0).max(10_080),
  robEnabled: z.boolean(),
  robChance: z.number().int().min(0).max(100),
  robCooldownMin: z.number().int().min(0).max(10_080),
  robMaxPercent: z.number().int().min(1).max(100),
  gambleEnabled: z.boolean(),
  gambleMax: z.number().int().min(1).max(100_000_000),
});
export type EconomyInput = z.infer<typeof economySchema>;

export const shopItemSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(200).optional().default(''),
  price: z.number().int().min(0).max(100_000_000),
  role_id: z.string().max(40).optional().default(''),
});
export type ShopItemInput = z.infer<typeof shopItemSchema>;

// ── Styl kart/banerów (Faza 7/F2) ──────────────────────────
export const cardStyleSchema = z.object({
  from: z.string().max(20),
  to: z.string().max(20),
  angle: z.number().int().min(0).max(360),
  font: z.string().max(40),
  textColor: z.string().max(20),
});
export type CardStyleInput = z.infer<typeof cardStyleSchema>;

// ── Powitania (POST /api/welcome) ──────────────────────────
export const welcomeSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  message: z.string().max(1000),
  autoroleId: z.string().max(40),
  cardEnabled: z.boolean().optional().default(false),
  card: cardStyleSchema.optional(),
});
export type WelcomeInput = z.infer<typeof welcomeSchema>;

// ── Automod (POST /api/automod) ────────────────────────────
export const automodSchema = z.object({
  enabled: z.boolean(),
  blockInvites: z.boolean(),
  blockLinks: z.boolean(),
  maxMentions: z.number().int().min(0).max(50),
  antiSpamCount: z.number().int().min(0).max(50),
  antiSpamSec: z.number().int().min(1).max(60),
  modlogChannelId: z.string().max(40),
  exemptRoleId: z.string().max(40),
});
export type AutomodInput = z.infer<typeof automodSchema>;

// ── Logi serwera (POST /api/logging) ──────────────────────
export const loggingSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  messages: z.boolean(),
  members: z.boolean(),
  memberUpdates: z.boolean(),
  moderation: z.boolean(),
  server: z.boolean(),
  voice: z.boolean(),
  ignoreChannels: z.array(z.string().max(40)).max(100),
});
export type LoggingInput = z.infer<typeof loggingSchema>;

// ── Weryfikacja (POST /api/verification) ───────────────────
export const verificationSchema = z.object({
  enabled: z.boolean(),
  roleId: z.string().max(40),
  message: z.string().max(1000),
  buttonLabel: z.string().max(80),
  mode: z.enum(['button', 'captcha']).optional().default('button'),
  minAccountAgeDays: z.number().int().min(0).max(365).optional().default(0),
});
export type VerificationInput = z.infer<typeof verificationSchema>;

// ── Anti-raid (POST /api/antiraid) ─────────────────────────
export const antiraidSchema = z.object({
  enabled: z.boolean(),
  joinCount: z.number().int().min(2).max(100),
  windowSec: z.number().int().min(1).max(300),
  action: z.enum(['kick', 'ban', 'timeout']),
  alertChannelId: z.string().max(40),
  minAccountAgeDays: z.number().int().min(0).max(365),
  altDetect: z.boolean().optional().default(false),
  altMinAgeDays: z.number().int().min(0).max(365).optional().default(7),
  altNoAvatar: z.boolean().optional().default(true),
  altAction: z.enum(['alert', 'kick', 'ban', 'timeout']).optional().default('alert'),
});
export type AntiRaidInput = z.infer<typeof antiraidSchema>;

// ── Modmail (POST /api/modmail) ────────────────────────────
export const modmailSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  greeting: z.string().max(1000),
});
export type ModmailInput = z.infer<typeof modmailSchema>;

// ── Sugestie (POST /api/suggestions) ───────────────────────
export const suggestionsSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  anonymous: z.boolean(),
});
export type SuggestionsInput = z.infer<typeof suggestionsSchema>;

// ── Komendy własne + autoresponder (POST /api/responder) ───
export const responderSchema = z.object({
  enabled: z.boolean(),
  prefix: z.string().min(1).max(5),
  commands: z
    .array(z.object({ name: z.string().min(1).max(40), response: z.string().min(1).max(2000) }))
    .max(100),
  autoresponders: z
    .array(
      z.object({
        trigger: z.string().min(1).max(100),
        response: z.string().min(1).max(2000),
        match: z.enum(['contains', 'exact', 'starts']),
      }),
    )
    .max(100),
});
export type ResponderInput = z.infer<typeof responderSchema>;

// ── Urodziny (POST /api/birthday) ──────────────────────────
export const birthdaySchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  message: z.string().max(1000),
  roleId: z.string().max(40),
});
export type BirthdayInput = z.infer<typeof birthdaySchema>;

// ── Liczniki kanałów (POST /api/counters) ──────────────────
export const countersSchema = z.object({
  enabled: z.boolean(),
  items: z
    .array(
      z.object({
        channelId: z.string().max(40),
        type: z.enum(['members', 'boosts', 'channels', 'roles']),
        template: z.string().min(1).max(100),
      }),
    )
    .max(20),
});
export type CountersInput = z.infer<typeof countersSchema>;

// ── AI-moderacja (POST /api/aimod) ─────────────────────────
export const aimodSchema = z.object({
  enabled: z.boolean(),
  action: z.enum(['delete', 'warn', 'log']),
  logChannelId: z.string().max(40),
  exemptRoleId: z.string().max(40),
});
export type AiModInput = z.infer<typeof aimodSchema>;

// ── Free-games feed (POST /api/freegames) ──────────────────
export const freegamesSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
});
export type FreeGamesInput = z.infer<typeof freegamesSchema>;

// ── Patch-notes (POST /api/patchnotes) ─────────────────────
export const patchnotesSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  apps: z
    .array(
      z.object({
        appId: z.number().int().min(1).max(100_000_000),
        name: z.string().min(1).max(80),
      }),
    )
    .max(20),
});
export type PatchNotesInput = z.infer<typeof patchnotesSchema>;

// ── Donejty Ko-fi (POST /api/kofi-config) ──────────────────
export const kofiSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  verificationToken: z.string().max(100),
  message: z.string().max(1000),
});
export type KofiInput = z.infer<typeof kofiSchema>;

// ── Sezonowe rankingi (POST /api/seasons) ──────────────────
export const seasonsSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  top: z.number().int().min(1).max(25),
  reset: z.boolean(),
});
export type SeasonsInput = z.infer<typeof seasonsSchema>;

// ── Śledzenie cen ITAD (POST /api/pricetracker) ────────────
export const pricetrackerSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
});
export type PriceTrackerInput = z.infer<typeof pricetrackerSchema>;

// ── Engagement: button-role (POST /api/buttonroles) ────────
export const buttonRolesSchema = z.object({
  message: z.string().max(500),
  buttons: z
    .array(
      z.object({
        label: z.string().max(80),
        roleId: z.string().max(40),
        emoji: z.string().max(64),
      }),
    )
    .max(25),
});
export type ButtonRolesInput = z.infer<typeof buttonRolesSchema>;

// ── Engagement: starboard (POST /api/starboard) ────────────
export const starboardSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  threshold: z.number().int().min(1).max(50),
  emoji: z.string().min(1).max(64),
});
export type StarboardInput = z.infer<typeof starboardSchema>;

// ── Engagement: temp-voice (POST /api/tempvoice) ───────────
export const tempvoiceSchema = z.object({
  enabled: z.boolean(),
  hubChannelId: z.string().max(40),
  categoryId: z.string().max(40),
  nameTemplate: z.string().max(100),
});
export type TempVoiceInput = z.infer<typeof tempvoiceSchema>;

// ── Biblioteka: lista życzeń (POST /api/wishlist) ──────────
export const wishlistAddSchema = z.object({
  title: z.string().min(1).max(200),
  cover_url: z.string().max(500).optional().default(''),
  igdb_id: z.number().int().nullable().optional(),
  store: z.string().max(20).optional().default(''),
  url: z.string().max(500).optional().default(''),
  release_year: z.number().int().nullable().optional(),
  note: z.string().max(300).optional().default(''),
});
export type WishlistAddInput = z.infer<typeof wishlistAddSchema>;

// ── Biblioteka: ręczne dodanie gry (POST /api/library/add) ──
export const manualGameSchema = z.object({
  title: z.string().min(1).max(200),
  store: z.string().min(1).max(20),
  igdb_id: z.number().int().nullable().optional(),
  release_year: z.number().int().nullable().optional(),
  genres: z.array(z.string().max(50)).max(20).optional().default([]),
  cover_url: z.string().max(500).optional().default(''),
  summary: z.string().max(2000).optional().default(''),
});
export type ManualGameInput = z.infer<typeof manualGameSchema>;

// ── Narzędzia twórcy (POST /api/creator) ───────────────────
export const creatorSchema = z.object({
  autoEvent: z.boolean(),
  eventName: z.string().max(100),
  clipRelay: z.boolean(),
  clipChannelId: z.string().max(40),
  pollMin: z.number().int().min(2).max(120),
});
export type CreatorInput = z.infer<typeof creatorSchema>;

// Pomocnik: czyta JSON z requestu i waliduje; zwraca dane lub komunikat błędu.
export async function parseBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, error: 'Body nie jest poprawnym JSON' };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join('.') || 'body'}: ${first.message}` : 'Nieprawidłowe dane',
    };
  }
  return { ok: true, data: parsed.data };
}
