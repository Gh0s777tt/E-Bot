// /aiserver — AI-kreator struktury serwera (Architekt 2.0). Opis → AI projektuje kategorie/kanały/role
// + poleca MODUŁY → PODGLĄD z przyciskami → po potwierdzeniu bot tworzy (z /undo). Graceful gdy AI off.
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  ChannelType,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type Guild,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { type Locale, resolveLocale, t } from '../i18n/index.mts';
import { aiConfig, type ChatMsg, callModel } from '../lib/ai.mts';
import { recordUndo } from '../lib/undo.mts';

const ACCENT = 0xe50914;

// Whitelista modułów, które architekt może POLECIĆ (anty-halucynacja — model nie wymyśli klucza spoza
// listy; klucze odpowiadają modułom bota włączanym w panelu / Centrum sterowania).
export const RECOMMENDABLE_MODULES = [
  'leveling',
  'economy',
  'welcome',
  'automod',
  'antiraid',
  'verification',
  'tickets',
  'modmail',
  'reactionroles',
  'starboard',
  'tempvoice',
  'counting',
  'suggestions',
  'giveaway',
  'birthdays',
  'counters',
  'freegames',
  'patchnotes',
  'pricetracker',
  'logging',
  'aimod',
] as const;

const SYSTEM = [
  'You are a Discord server architect. Read the description and design a server layout.',
  'Respond with ONLY a raw JSON object (no markdown, no code fences, no commentary), exactly this shape:',
  '{"categories":[{"name":"🎮 Name","channels":[{"name":"💬 general","voice":false}]}],"roles":[{"name":"Member"}],"modules":["leveling","welcome"]}',
  'Rules: 2-4 categories, each 2-6 channels; 0-6 roles (names only).',
  `"modules": 0-8 keys EXACTLY from this list that best fit the server (keys only, no others): ${RECOMMENDABLE_MODULES.join(', ')}.`,
  'Prefix every category and channel name with a fitting emoji. Use the same language as the description.',
  'Keep it focused and relevant. Output JSON only.',
].join('\n');

type PlanChannel = { name?: string; voice?: boolean };
type PlanCategory = { name?: string; channels?: PlanChannel[] };
type Plan = { categories?: PlanCategory[]; roles?: { name?: string }[]; modules?: unknown };

export function parsePlan(text: string): Plan | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1)) as Plan;
    return Array.isArray(obj.categories) ? obj : null;
  } catch {
    return null;
  }
}

// Wybiera polecane moduły z odpowiedzi modelu, walidując względem whitelisty (anty-halucynacja),
// deduplikując i ograniczając do 8. Czysta funkcja → test.
export function pickModules(raw: unknown, whitelist: readonly string[]): string[] {
  if (!Array.isArray(raw)) return [];
  const allow = new Set(whitelist);
  const out: string[] = [];
  for (const m of raw) {
    const k = String(m ?? '')
      .toLowerCase()
      .trim();
    if (allow.has(k) && !out.includes(k)) out.push(k);
    if (out.length >= 8) break;
  }
  return out;
}

const nm = (s: unknown): string =>
  String(s ?? '')
    .slice(0, 90)
    .trim();

// Czytelne drzewo podglądu (kategorie → kanały + role). Czysta funkcja → test. Cap pod limit opisu embeda.
export function planTree(plan: Plan): string {
  const lines: string[] = [];
  for (const cat of (plan.categories ?? []).slice(0, 4)) {
    if (!nm(cat?.name)) continue;
    lines.push(`**${nm(cat.name)}**`);
    for (const ch of (Array.isArray(cat.channels) ? cat.channels : []).slice(0, 6)) {
      if (!nm(ch?.name)) continue;
      lines.push(` ${ch.voice ? '🔊' : '＃'} ${nm(ch.name)}`);
    }
  }
  const roles = (plan.roles ?? [])
    .slice(0, 6)
    .map((r) => nm(r?.name))
    .filter(Boolean);
  if (roles.length) lines.push(`\n🏷️ ${roles.join(' · ')}`);
  return lines.join('\n').slice(0, 3900) || '—';
}

// Magazyn planów oczekujących na potwierdzenie (klucz = interaction.id). TTL 10 min, sprzątany leniwie.
const PENDING_TTL = 10 * 60_000;
const pending = new Map<string, { plan: Plan; userId: string; ts: number }>();
function prunePending(): void {
  const now = Date.now();
  for (const [k, v] of pending) if (now - v.ts > PENDING_TTL) pending.delete(k);
}

// Tworzy strukturę z planu (kategorie/kanały/role) + rejestruje /undo. Wydzielone: używane po potwierdzeniu.
async function createStructure(
  guild: Guild,
  plan: Plan,
): Promise<{ cats: number; channels: number; roles: number }> {
  let cats = 0;
  let channels = 0;
  const chIds: string[] = [];
  const roleIds: string[] = [];
  for (const cat of (plan.categories ?? []).slice(0, 4)) {
    if (!nm(cat?.name)) continue;
    const category = await guild.channels.create({
      name: nm(cat.name),
      type: ChannelType.GuildCategory,
    });
    cats++;
    const list = Array.isArray(cat.channels) ? cat.channels.slice(0, 6) : [];
    for (const ch of list) {
      if (!nm(ch?.name)) continue;
      const created = await guild.channels.create({
        name: nm(ch.name),
        type: ch.voice ? ChannelType.GuildVoice : ChannelType.GuildText,
        parent: category.id,
      });
      chIds.push(created.id);
      channels++;
    }
    chIds.push(category.id); // kategoria po dzieciach (kolejność usuwania w /undo)
  }
  for (const r of (plan.roles ?? []).slice(0, 6)) {
    if (!nm(r?.name)) continue;
    const role = await guild.roles.create({ name: nm(r.name) });
    roleIds.push(role.id);
  }
  recordUndo({ channels: chIds, roles: roleIds, label: 'aiserver' });
  return { cats, channels, roles: roleIds.length };
}

function previewEmbed(locale: Locale, plan: Plan): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, 'aiserver.preview'))
    .setDescription(planTree(plan));
  const modules = pickModules(plan.modules, RECOMMENDABLE_MODULES);
  if (modules.length) embed.addFields({ name: '🧩', value: modules.join(' · ') });
  return embed;
}

export const data = new SlashCommandBuilder()
  .setName('aiserver')
  .setDescription('AI zaprojektuje i utworzy strukturę serwera z Twojego opisu.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((o) =>
    o
      .setName('opis')
      .setDescription('Opisz serwer (np. „klan CS2 z sekcją turniejów i streamów")')
      .setRequired(true)
      .setMaxLength(500),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({
      content: t(locale, 'sticky.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const cfg = aiConfig();
  if (!cfg.enabled) {
    await interaction.reply({ content: t(locale, 'aiserver.off'), flags: MessageFlags.Ephemeral });
    return;
  }
  const desc = interaction.options.getString('opis', true);
  await interaction.deferReply();

  let text: string;
  try {
    const messages: ChatMsg[] = [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: desc },
    ];
    const out = await callModel(cfg.model, messages, 900);
    text = out.text;
  } catch {
    await interaction.editReply({ content: t(locale, 'aiserver.off') });
    return;
  }

  const plan = parsePlan(text);
  if (!plan?.categories?.length) {
    await interaction.editReply({ content: t(locale, 'aiserver.fail') });
    return;
  }

  // Architekt 2.0: PODGLĄD przed utworzeniem — plan trafia do magazynu, user potwierdza przyciskiem.
  prunePending();
  pending.set(interaction.id, { plan, userId: interaction.user.id, ts: Date.now() });
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`aiserver:apply:${interaction.id}`)
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId(`aiserver:cancel:${interaction.id}`)
      .setStyle(ButtonStyle.Danger)
      .setEmoji('✖️'),
  );
  await interaction.editReply({ embeds: [previewEmbed(locale, plan)], components: [row] });
}

// Routing z index.mts dla przycisków „aiserver:apply|cancel:<token>".
export async function handleAiServerButton(interaction: ButtonInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const [, action, token] = interaction.customId.split(':');
  const entry = token ? pending.get(token) : undefined;
  // Tylko autor + ważny (niewygasły) token — inaczej efemerycznie odrzuć (np. klik innego usera / TTL).
  if (!entry || entry.userId !== interaction.user.id) {
    await interaction.reply({ content: t(locale, 'aiserver.fail'), flags: MessageFlags.Ephemeral });
    return;
  }
  pending.delete(token);

  if (action === 'cancel') {
    await interaction.update({
      content: t(locale, 'aiserver.cancelled'),
      embeds: [],
      components: [],
    });
    return;
  }
  const guild = interaction.guild;
  if (!guild) {
    await interaction.update({
      content: t(locale, 'sticky.guildOnly'),
      embeds: [],
      components: [],
    });
    return;
  }
  await interaction.update({ components: [] }); // zdejmij przyciski (tworzenie w toku)
  try {
    const r = await createStructure(guild, entry.plan);
    const modules = pickModules(entry.plan.modules, RECOMMENDABLE_MODULES);
    const base = t(locale, 'aiserver.created', {
      cats: String(r.cats),
      channels: String(r.channels),
      roles: String(r.roles),
    });
    await interaction.editReply({
      content: modules.length ? `${base}\n🧩 ${modules.join(' · ')}` : base,
      embeds: [],
    });
  } catch {
    await interaction.editReply({ content: t(locale, 'aiserver.fail'), embeds: [] });
  }
}
