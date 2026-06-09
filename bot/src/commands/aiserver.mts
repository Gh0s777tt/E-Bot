// /aiserver — AI-kreator struktury serwera (Architekt v2). Opis → AI projektuje kategorie/kanały/role
// (JSON) → bot tworzy. Używa istniejącego silnika AI (lib/ai.mts). Graceful, gdy AI off / bez klucza.
import {
  ChannelType,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { aiConfig, type ChatMsg, callModel } from '../lib/ai.mts';

const SYSTEM = [
  'You are a Discord server architect. Read the description and design a server layout.',
  'Respond with ONLY a raw JSON object (no markdown, no code fences, no commentary), exactly this shape:',
  '{"categories":[{"name":"🎮 Name","channels":[{"name":"💬 general","voice":false}]}],"roles":[{"name":"Member"}]}',
  'Rules: 2-4 categories, each 2-6 channels; 0-6 roles (names only).',
  'Prefix every category and channel name with a fitting emoji. Use the same language as the description.',
  'Keep it focused and relevant. Output JSON only.',
].join('\n');

type PlanChannel = { name?: string; voice?: boolean };
type PlanCategory = { name?: string; channels?: PlanChannel[] };
type Plan = { categories?: PlanCategory[]; roles?: { name?: string }[] };

function parsePlan(text: string): Plan | null {
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

const nm = (s: unknown): string =>
  String(s ?? '')
    .slice(0, 90)
    .trim();

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
    await interaction.editReply({ content: t(locale, 'aiserver.off') }); // brak klucza / model niedostępny
    return;
  }

  const plan = parsePlan(text);
  if (!plan?.categories?.length) {
    await interaction.editReply({ content: t(locale, 'aiserver.fail') });
    return;
  }

  try {
    let cats = 0;
    let channels = 0;
    let roles = 0;
    for (const cat of plan.categories.slice(0, 4)) {
      if (!nm(cat?.name)) continue;
      const category = await guild.channels.create({
        name: nm(cat.name),
        type: ChannelType.GuildCategory,
      });
      cats++;
      const list = Array.isArray(cat.channels) ? cat.channels.slice(0, 6) : [];
      for (const ch of list) {
        if (!nm(ch?.name)) continue;
        await guild.channels.create({
          name: nm(ch.name),
          type: ch.voice ? ChannelType.GuildVoice : ChannelType.GuildText,
          parent: category.id,
        });
        channels++;
      }
    }
    for (const r of (plan.roles ?? []).slice(0, 6)) {
      if (!nm(r?.name)) continue;
      await guild.roles.create({ name: nm(r.name) });
      roles++;
    }
    await interaction.editReply({
      content: t(locale, 'aiserver.created', {
        cats: String(cats),
        channels: String(channels),
        roles: String(roles),
      }),
    });
  } catch {
    await interaction.editReply({ content: t(locale, 'aiserver.fail') });
  }
}
