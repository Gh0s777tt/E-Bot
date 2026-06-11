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

// ── Język bota (POST /api/locale) — 'auto' = locale klienta Discord usera ──
export const botLocaleSchema = z.object({
  locale: z.enum([
    'auto',
    'pl',
    'en',
    'de',
    'es',
    'it',
    'fr',
    'pt',
    'zh',
    'ko',
    'ru',
    'uk',
    'ja',
    'ar',
    'id',
  ]),
});
export type BotLocaleInput = z.infer<typeof botLocaleSchema>;

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
  levelUpDm: z.boolean().optional().default(false),
  achievementsEnabled: z.boolean().optional().default(false),
  prestigeEnabled: z.boolean(),
  prestigeLevel: z.number().int().min(1).max(1000),
  prestigeRoleId: z.string().max(40),
});
export type LevelingInput = z.infer<typeof levelingSchema>;

// ── Bogata wiadomość / embed (Message Studio, Faza 8) ──────
export const richEmbedSchema = z.object({
  title: z.string().max(256).default(''),
  url: z.string().max(500).default(''),
  description: z.string().max(4096).default(''),
  color: z.string().max(20).default(''),
  authorName: z.string().max(256).default(''),
  authorIcon: z.string().max(500).default(''),
  authorUrl: z.string().max(500).default(''),
  thumbnailUrl: z.string().max(500).default(''),
  imageUrl: z.string().max(500).default(''),
  footerText: z.string().max(2048).default(''),
  footerIcon: z.string().max(500).default(''),
  timestamp: z.boolean().default(false),
  fields: z
    .array(
      z.object({
        name: z.string().max(256),
        value: z.string().max(1024),
        inline: z.boolean().default(false),
      }),
    )
    .max(25)
    .default([]),
});
// Components V2 (Etap I) — bloki nowego formatu wiadomości (tryb opcjonalny w Message Studio).
const v2BlockSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), text: z.string().max(4000) }),
  z.object({
    kind: z.literal('separator'),
    divider: z.boolean().default(true),
    large: z.boolean().default(false),
  }),
  z.object({ kind: z.literal('gallery'), urls: z.array(z.string().max(500)).max(10) }),
  z.object({
    kind: z.literal('section'),
    text: z.string().max(4000),
    thumbnailUrl: z.string().max(500),
  }),
]);
export const richMessageSchema = z.object({
  content: z.string().max(2000).default(''),
  useEmbed: z.boolean().default(false),
  embed: richEmbedSchema.optional(),
  useV2: z.boolean().optional().default(false),
  v2: z
    .object({
      accentColor: z.string().max(9).default(''),
      blocks: z.array(v2BlockSchema).max(10).default([]),
    })
    .optional(),
});
export type RichMessageInput = z.infer<typeof richMessageSchema>;

// ── Szablony Message Studio (POST /api/studio/templates) ───
export const studioTemplatesSchema = z.object({
  templates: z.array(z.object({ name: z.string().min(1).max(60), msg: richMessageSchema })).max(50),
});
export type StudioTemplatesInput = z.infer<typeof studioTemplatesSchema>;

// ── No-code komendy slash (POST /api/custom-commands) ──────
export const customCommandSchema = z.object({
  name: z.string().regex(/^[a-z0-9_-]{1,32}$/, 'małe litery/cyfry/-/_, 1–32 znaki'),
  description: z.string().min(1).max(100),
  response: richMessageSchema,
  ephemeral: z.boolean().default(false),
  options: z
    .array(
      z.object({
        name: z.string().regex(/^[a-z0-9_-]{1,32}$/),
        description: z.string().max(100).default(''),
        required: z.boolean().default(false),
      }),
    )
    .max(25)
    .optional()
    .default([]),
  type: z.enum(['message', 'random', 'role', 'help']).optional().default('message'),
  randomLines: z.array(z.string().min(1).max(2000)).max(50).optional().default([]),
  roleId: z.string().max(40).optional().default(''),
  cooldownSec: z.number().int().min(0).max(86400).optional().default(0),
  category: z.string().max(40).optional().default(''),
  requiredRoleId: z.string().max(40).optional().default(''),
  actions: z
    .array(
      z.object({
        kind: z.enum(['addRole', 'removeRole', 'giveMoney', 'giveXp']),
        roleId: z.string().max(40).optional().default(''),
        amount: z.number().int().min(0).max(1_000_000).optional().default(0),
      }),
    )
    .max(3)
    .optional()
    .default([]),
});
export const customCommandsSchema = z.object({
  commands: z.array(customCommandSchema).max(25),
});
export type CustomCommandsInput = z.infer<typeof customCommandsSchema>;

// ── Użytkownicy panelu / role (POST /api/panel-staff) ──────
export const panelStaffSchema = z.object({
  staff: z
    .array(
      z.object({
        uid: z.string().regex(/^\d{15,25}$/, 'Discord ID (15–25 cyfr)'),
        label: z.string().max(60).default(''),
        role: z.enum(['admin', 'editor', 'viewer']),
      }),
    )
    .max(50),
});
export type PanelStaffInput = z.infer<typeof panelStaffSchema>;

// ── Tickety (POST /api/tickets) ────────────────────────────
export const ticketCategorySchema = z.object({
  id: z.string().max(20),
  label: z.string().min(1).max(80),
  emoji: z.string().max(64).optional().default(''),
  style: z.enum(['primary', 'secondary', 'success', 'danger']).optional().default('primary'),
  supportRoleId: z.string().max(40).optional().default(''),
  welcome: z.string().max(1000).optional().default(''),
});
export const ticketsConfigSchema = z.object({
  enabled: z.boolean(),
  categoryId: z.string().max(40),
  supportRoleId: z.string().max(40),
  welcome: z.string().max(500),
  logChannelId: z.string().max(40),
  panelMessage: z.string().max(1000).optional().default('Masz sprawę? Otwórz ticket. 🎟️'),
  panelSpec: richMessageSchema.optional(),
  categories: z.array(ticketCategorySchema).max(10).optional().default([]),
  ratingEnabled: z.boolean().optional().default(true),
  slaHours: z.number().int().min(0).max(720).optional().default(0),
  questions: z.array(z.string().min(1).max(100)).max(4).optional().default([]),
});
export type TicketsConfigInput = z.infer<typeof ticketsConfigSchema>;

// ── Komendy AI (POST /api/ai-config) ───────────────────────
export const aiConfigSchema = z.object({
  enabled: z.boolean(),
  model: z.enum(['deepseek', 'openai']),
  dailyRequestLimit: z.number().int().min(0).max(10_000),
  dailyTokenLimit: z.number().int().min(0).max(10_000_000),
  persona: z.string().max(1000).optional().default(''),
});
export type AiConfigInput = z.infer<typeof aiConfigSchema>;

// ── AI-pomoc (RAG-lite, Tor C) ──
export const aihelpSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  knowledge: z.string().max(6000),
});
export type AiHelpInput = z.infer<typeof aihelpSchema>;

// ── Dzienny AI-digest (Tor J) ──
export const aidigestSchema = z.object({
  enabled: z.boolean(),
  sourceChannelId: z.string().max(40),
  targetChannelId: z.string().max(40),
  hourUTC: z.number().int().min(0).max(23),
});
export type AiDigestInput = z.infer<typeof aidigestSchema>;

// ── Aplikacje / rekrutacja (Tor K / Faza 8: wiele aplikacji) ──
export const applicationSchema = z.object({
  id: z.string().max(20),
  label: z.string().min(1).max(80),
  emoji: z.string().max(64).optional().default(''),
  style: z.enum(['primary', 'secondary', 'success', 'danger']).optional().default('primary'),
  reviewChannelId: z.string().max(40).optional().default(''),
  acceptRoleId: z.string().max(40).optional().default(''),
  questions: z.array(z.string().min(1).max(200)).max(5).optional().default([]),
});
export const applicationsSchema = z.object({
  enabled: z.boolean(),
  reviewChannelId: z.string().max(40),
  roleId: z.string().max(40),
  panelMessage: z.string().max(500),
  questions: z.array(z.string().min(1).max(200)).max(5),
  panelSpec: richMessageSchema.optional(),
  applications: z.array(applicationSchema).max(10).optional().default([]),
});
export type ApplicationsInput = z.infer<typeof applicationsSchema>;

// ── Twitch sub → rola (Tor N) ──
export const twitchSubSchema = z.object({
  enabled: z.boolean(),
  roleId: z.string().max(40),
});
export type TwitchSubInput = z.infer<typeof twitchSubSchema>;

// ── Automatyzacje IFTTT-lite (Tor O) ──
export const automationsSchema = z.object({
  enabled: z.boolean(),
  rules: z
    .array(
      z.object({
        event: z.enum(['join', 'keyword']),
        keyword: z.string().max(100).optional().default(''),
        action: z.enum(['message', 'role', 'dm']),
        channelId: z.string().max(40).optional().default(''),
        roleId: z.string().max(40).optional().default(''),
        text: z.string().max(1500).optional().default(''),
      }),
    )
    .max(20),
});
export type AutomationsInput = z.infer<typeof automationsSchema>;

// ── Tygodniowy digest (Tor E) ──
export const digestSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
});
export type DigestInput = z.infer<typeof digestSchema>;

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

// ── Reaction-role panel (Faza 8: utwórz embed + pary emoji→rola) ──
export const reactionPanelSchema = z.object({
  panelSpec: richMessageSchema.optional(),
  pairs: z
    .array(z.object({ emoji: z.string().min(1).max(64), roleId: z.string().max(40) }))
    .max(20)
    .optional()
    .default([]),
  exclusive: z.boolean().optional().default(false),
});
export type ReactionPanelInput = z.infer<typeof reactionPanelSchema>;

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
  bankInterestPct: z.number().min(0).max(100).optional().default(0),
  payTaxPct: z.number().min(0).max(50).optional().default(0),
  levelUpMoney: z.number().int().min(0).max(1_000_000).optional().default(0),
});
export type EconomyInput = z.infer<typeof economySchema>;

// ── Sezon ekonomii (POST /api/eco-season) ─────────────────
export const ecoSeasonSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  reward1: z.number().int().min(0).max(100_000_000),
  reward2: z.number().int().min(0).max(100_000_000),
  reward3: z.number().int().min(0).max(100_000_000),
  reset: z.boolean(),
});
export type EcoSeasonInput = z.infer<typeof ecoSeasonSchema>;

export const shopItemSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(200).optional().default(''),
  price: z.number().int().min(0).max(100_000_000),
  role_id: z.string().max(40).optional().default(''),
  effect: z.enum(['', 'xp2', 'shield', 'lootbox']).optional().default(''),
  duration_days: z.number().int().min(0).max(3650).optional().default(0), // Etap J — rola czasowa (0 = na stałe)
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
  messageSpec: richMessageSchema.optional(),
  autoroleDelaySec: z.number().int().min(0).max(3600).optional().default(0),
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
  bannedWords: z.array(z.string().min(1).max(100)).max(300).optional().default([]),
  bannedRegex: z.array(z.string().min(1).max(200)).max(20).optional().default([]),
  allowedLinks: z.array(z.string().min(1).max(100)).max(50).optional().default([]),
  ignoreChannels: z.array(z.string().max(40)).max(50).optional().default([]),
  antiScam: z
    .object({
      enabled: z.boolean(),
      customDomains: z.array(z.string().min(1).max(120)).max(200).optional().default([]),
    })
    .optional(),
  pii: z
    .object({
      enabled: z.boolean(),
      types: z
        .object({
          creditCard: z.boolean(),
          pesel: z.boolean(),
          idCard: z.boolean(),
          iban: z.boolean(),
          email: z.boolean(),
          phone: z.boolean(),
        })
        .partial()
        .optional(),
    })
    .optional(),
  action: z.enum(['delete', 'timeout', 'kick', 'ban']).optional().default('delete'),
  timeoutMinutes: z.number().int().min(1).max(40320).optional().default(10),
  escalation: z
    .object({
      enabled: z.boolean(),
      threshold: z.number().int().min(2).max(20),
      windowMin: z.number().int().min(1).max(120),
      action: z.enum(['timeout', 'kick', 'ban']),
    })
    .optional(),
  antiCaps: z
    .object({
      enabled: z.boolean(),
      percent: z.number().int().min(10).max(100),
      minLength: z.number().int().min(1).max(500),
    })
    .optional(),
  antiSpoiler: z
    .object({
      enabled: z.boolean(),
      maxSpoilers: z.number().int().min(0).max(50),
    })
    .optional(),
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
  mode: z.enum(['button', 'captcha', 'phrase']).optional().default('button'),
  minAccountAgeDays: z.number().int().min(0).max(365).optional().default(0),
  phrase: z.string().max(100).optional().default(''),
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
  autoLockdown: z.boolean().optional().default(false),
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
        type: z.enum([
          'members',
          'humans',
          'bots',
          'boosts',
          'boostTier',
          'channels',
          'roles',
          'emojis',
          'stickers',
          'voice',
          'ytSubs',
          'ytViews',
          'ytVideos',
          'twFollowers',
          'twSubs',
          'twViewers',
          'kickFollowers',
          'kickViewers',
        ]),
        template: z.string().min(1).max(100),
        arg: z.string().max(60).optional(),
      }),
    )
    .max(20),
});
export type CountersInput = z.infer<typeof countersSchema>;

// ── Kreator startowy (POST /api/setup) ────────────────────
export const setupSchema = z.object({
  preset: z.enum(['streamer', 'gaming', 'community']),
});
export type SetupInput = z.infer<typeof setupSchema>;

// ── Architekt serwera — provisioning (POST /api/setup/provision) ──
export const provisionSchema = z.object({
  blocks: z
    .array(z.enum(['welcome', 'logs', 'tickets', 'announce', 'counters', 'muted', 'levelRoles']))
    .min(1)
    .max(7),
});
export type ProvisionInput = z.infer<typeof provisionSchema>;

// ── Architekt serwera — AI-kreator (POST /api/setup/ai) ──
export const aiSetupSchema = z.object({
  description: z.string().min(3).max(500),
});
export type AiSetupInput = z.infer<typeof aiSetupSchema>;

// ── Architekt serwera — blueprint (POST /api/setup/blueprint) ──
export const blueprintSchema = z
  .object({
    modules: z
      .array(
        z.enum([
          'welcome_config',
          'leveling_config',
          'economy_config',
          'automod_config',
          'tickets_config',
          'verification_config',
          'counters_config',
        ]),
      )
      .max(10),
    blocks: z
      .array(z.enum(['welcome', 'logs', 'tickets', 'announce', 'counters', 'muted', 'levelRoles']))
      .max(7),
  })
  .refine((d) => d.modules.length > 0 || d.blocks.length > 0, 'Pusty blueprint');
export type BlueprintInput = z.infer<typeof blueprintSchema>;

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
  multiStore: z.boolean().optional().default(false),
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

// ── Donejty: linki wsparcia (Faza 8: PayPal/BMC/Patreon/…) ──
export const donateSchema = z.object({
  enabled: z.boolean(),
  title: z.string().max(256).optional().default('💖 Wesprzyj nas'),
  description: z.string().max(2000).optional().default(''),
  providers: z
    .array(
      z.object({
        label: z.string().min(1).max(80),
        url: z.string().min(1).max(300),
        emoji: z.string().max(64).optional().default(''),
      }),
    )
    .max(10)
    .optional()
    .default([]),
});
export type DonateInput = z.infer<typeof donateSchema>;

// ── Powiadomienia social (RSS) — Faza 8 ──
export const socialFeedsSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  message: z.string().max(2000),
  feeds: z
    .array(
      z.object({
        url: z.string().min(1).max(500),
        label: z.string().max(60).optional().default(''),
      }),
    )
    .max(15)
    .optional()
    .default([]),
});
export type SocialFeedsInput = z.infer<typeof socialFeedsSchema>;

// ── Generic incoming webhook (Faza 8) ──
export const webhookRelaySchema = z.object({
  enabled: z.boolean(),
  token: z.string().max(100),
  channelId: z.string().max(40),
  message: z.string().max(2000),
});
export type WebhookRelayInput = z.infer<typeof webhookRelaySchema>;

// ── Zaplanowane posty (POST /api/scheduled-posts) ──────────
export const scheduledPostSchema = z.object({
  id: z.string().max(40),
  enabled: z.boolean().default(true),
  label: z.string().max(80).default(''),
  channelId: z.string().max(40),
  message: richMessageSchema,
  mode: z.enum(['once', 'daily', 'weekly']),
  runAt: z.number().int().optional(),
  time: z
    .string()
    .regex(/^([01]?\d|2[0-3]):[0-5]\d$/)
    .optional(),
  weekday: z.number().int().min(0).max(6).optional(),
});
export const scheduledPostsSchema = z.object({
  posts: z.array(scheduledPostSchema).max(50),
});
export type ScheduledPostsInput = z.infer<typeof scheduledPostsSchema>;

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

// ── Engagement: menu ról (dropdown, Tor F) ──
export const roleMenuSchema = z.object({
  message: z.string().max(500),
  placeholder: z.string().max(150),
  options: z
    .array(
      z.object({
        label: z.string().min(1).max(80),
        roleId: z.string().max(40),
        description: z.string().max(100).optional().default(''),
        emoji: z.string().max(64).optional().default(''),
      }),
    )
    .max(25),
});
export type RoleMenuInput = z.infer<typeof roleMenuSchema>;

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

// ── Engagement: counting (Tor 3) ──
export const countingSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().max(40),
  allowSameUser: z.boolean(),
  resetOnFail: z.boolean(),
});
export type CountingInput = z.infer<typeof countingSchema>;

// ── Engagement: invite tracker (Tor 3) ──
export const invitesSchema = z.object({
  enabled: z.boolean(),
  logChannelId: z.string().max(40),
  fakeMinAgeDays: z.number().int().min(0).max(365),
  rewards: z
    .array(z.object({ count: z.number().int().min(1).max(100_000), roleId: z.string().max(40) }))
    .max(20),
});
export type InvitesInput = z.infer<typeof invitesSchema>;

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
