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
});
export type LevelingInput = z.infer<typeof levelingSchema>;

// ── Tickety (POST /api/tickets) ────────────────────────────
export const ticketsConfigSchema = z.object({
  enabled: z.boolean(),
  categoryId: z.string().max(40),
  supportRoleId: z.string().max(40),
  welcome: z.string().max(500),
  logChannelId: z.string().max(40),
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

// ── Powitania (POST /api/welcome) ──────────────────────────
export const welcomeSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  message: z.string().max(1000),
  autoroleId: z.string().max(40),
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
