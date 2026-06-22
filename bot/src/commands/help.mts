// /help — interaktywny hub pomocy: embed + menu kategorii (StringSelect). Wybór kategorii pokazuje
// jej komendy z opisami „co robią" (reużyte z COMMAND_DESC → 14 języków). Efemeryczne.
// Obsługa selecta: handleHelpSelect (routing po customId 'help:cat' w index.mts).
import {
  ActionRowBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  type StringSelectMenuInteraction,
} from 'discord.js';
import { COMMAND_DESC } from '../i18n/commandDescriptions.mts';
import { type Locale, resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;

// Kategorie → komendy. Klucz kategorii = sufiks kluczy i18n help.cat.* / help.blurb.*.
export const CATEGORIES: { key: string; cmds: string[] }[] = [
  { key: 'moderation', cmds: ['mod', 'case', 'antinuke', 'lockdown'] },
  { key: 'levels', cmds: ['rank', 'profile', 'xp', 'xpevent', 'prestige', 'hof', 'quests'] },
  { key: 'economy', cmds: ['eco', 'market', 'lottery', 'skins'] },
  {
    key: 'community',
    cmds: ['rep', 'confess', 'suggest', 'poll', 'birthday', 'afk', 'highlight', 'invites', 'event'],
  },
  { key: 'creator', cmds: ['link', 'linktwitch', 'portal', 'donate'] },
  { key: 'fun', cmds: ['fun', 'trivia', 'giveaway'] },
  { key: 'ai', cmds: ['ai', 'ask', 'tldr', 'translate', 'imagine', 'describe', 'rewrite'] },
  { key: 'games', cmds: ['library', 'wishlist', 'backlog'] },
  { key: 'tools', cmds: ['ping', 'remind'] },
  {
    key: 'panels',
    cmds: [
      'applypanel',
      'ticketpanel',
      'verifypanel',
      'buttonpanel',
      'reactionpanel',
      'rolemenu',
      'schedule',
      'ticket',
    ],
  },
];

const TOTAL = CATEGORIES.reduce((a, c) => a + c.cmds.length, 0);

// Płaska lista wszystkich komend (z kategorią) — do wyszukiwarki /help szukaj (autocomplete).
const ALL_CMDS: { name: string; cat: string }[] = CATEGORIES.flatMap((c) =>
  c.cmds.map((name) => ({ name, cat: c.key })),
);

export function cmdDesc(locale: Locale, name: string): string {
  return COMMAND_DESC[locale]?.[name] ?? COMMAND_DESC.en?.[name] ?? COMMAND_DESC.pl?.[name] ?? '';
}

function menu(locale: Locale, selected?: string): ActionRowBuilder<StringSelectMenuBuilder> {
  const sel = new StringSelectMenuBuilder()
    .setCustomId('help:cat')
    .setPlaceholder(t(locale, 'help.pick'))
    .addOptions(
      CATEGORIES.map((c) => ({
        label: t(locale, `help.cat.${c.key}`).slice(0, 100),
        description: t(locale, `help.blurb.${c.key}`).slice(0, 100),
        value: c.key,
        default: c.key === selected,
      })),
    );
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(sel);
}

function homeEmbed(locale: Locale): EmbedBuilder {
  const list = CATEGORIES.map(
    (c) => `${t(locale, `help.cat.${c.key}`)} — ${t(locale, `help.blurb.${c.key}`)}`,
  ).join('\n');
  return new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, 'help.title'))
    .setDescription(`${t(locale, 'help.intro')}\n\n${list}`)
    .setFooter({ text: t(locale, 'help.footer', { count: TOTAL }) });
}

function categoryEmbed(locale: Locale, key: string): EmbedBuilder {
  const cat = CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
  const lines = cat.cmds.map((name) => `**/${name}** — ${cmdDesc(locale, name)}`).join('\n');
  return new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, `help.cat.${cat.key}`))
    .setDescription(`_${t(locale, `help.blurb.${cat.key}`)}_\n\n${lines}`.slice(0, 4000))
    .setFooter({ text: t(locale, 'help.footer', { count: TOTAL }) });
}

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Pomoc — wszystkie komendy bota pogrupowane w kategorie.')
  .addStringOption((o) =>
    o
      .setName('szukaj')
      .setDescription('Szukaj komendy po nazwie lub opisie (autouzupełnianie).')
      .setAutocomplete(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  // Wyszukiwarka: /help szukaj:<komenda> → szczegóły komendy (autocomplete podaje dokładną nazwę).
  const query = interaction.options.getString('szukaj');
  if (query) {
    const q = query.toLowerCase().replace(/^\//, '');
    const entry = ALL_CMDS.find((c) => c.name === q) ?? ALL_CMDS.find((c) => c.name.includes(q));
    if (entry) {
      await interaction.reply({
        embeds: [commandDetailEmbed(locale, entry)],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }
  await interaction.reply({
    embeds: [homeEmbed(locale)],
    components: [menu(locale)],
    flags: MessageFlags.Ephemeral,
  });
}

// Embed szczegółów pojedynczej komendy (wynik wyszukiwarki).
function commandDetailEmbed(locale: Locale, entry: { name: string; cat: string }): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(`/${entry.name}`)
    .setDescription(
      `${cmdDesc(locale, entry.name) || '—'}\n\n📂 ${t(locale, `help.cat.${entry.cat}`)}`,
    )
    .setFooter({ text: t(locale, 'help.footer', { count: TOTAL }) });
}

// Autouzupełnianie nazw komend dla opcji „szukaj" (match po nazwie LUB opisie w języku użytkownika).
export async function autocomplete(interaction: AutocompleteInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const q = interaction.options.getFocused().toLowerCase().replace(/^\//, '');
  const choices = ALL_CMDS.filter(
    (c) => !q || c.name.includes(q) || cmdDesc(locale, c.name).toLowerCase().includes(q),
  )
    .slice(0, 25)
    .map((c) => ({ name: `/${c.name} — ${cmdDesc(locale, c.name)}`.slice(0, 100), value: c.name }));
  await interaction.respond(choices);
}

// Routing z dispatchera (index.mts) dla StringSelect o customId 'help:cat'.
export async function handleHelpSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const key = interaction.values[0];
  await interaction.update({
    embeds: [categoryEmbed(locale, key)],
    components: [menu(locale, key)],
  });
}
