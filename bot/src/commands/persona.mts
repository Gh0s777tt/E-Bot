// /persona — osobowość bota AI. Zapisuje 'ai_config'.persona (prefiks system-promptu czytany
// przez /ai, /ask, aihelp, aidigest). Gotowe presety + własny opis. Perm: ManageGuild.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { aiConfig } from '../lib/ai.mts';
import { setSetting } from '../lib/db.mts';

const ACCENT = 0xe50914;
const LANG_SUFFIX = " Always reply in the user's language.";

// Gotowe osobowości — prompt to krótka dyrektywa tonu (działa w każdym języku odpowiedzi).
const PRESETS: { value: string; name: string; prompt: string }[] = [
  {
    value: 'friendly',
    name: '😊 Przyjazny',
    prompt: 'You are warm, friendly and encouraging. Be upbeat and supportive in every reply.',
  },
  {
    value: 'sarcastic',
    name: '😏 Sarkastyczny',
    prompt: 'You are witty and playfully sarcastic with dry humor, but still genuinely helpful.',
  },
  {
    value: 'pirate',
    name: '🏴‍☠️ Pirat',
    prompt:
      'You speak like a swashbuckling pirate, using pirate slang and nautical flair. Stay in character.',
  },
  {
    value: 'gamer',
    name: '🎮 Gracz',
    prompt: 'You are a hype gamer who uses gaming slang (gg, pog, clutch) and high energy.',
  },
  {
    value: 'formal',
    name: '🎩 Formalny',
    prompt: 'You are professional, formal and precise. Use polished, courteous language.',
  },
  {
    value: 'wholesome',
    name: '🤗 Wspierający',
    prompt: 'You are extremely kind, wholesome and uplifting. Encourage and reassure the user.',
  },
  {
    value: 'robot',
    name: '🤖 Robot',
    prompt: 'You are a terse robot. Reply concisely and mechanically, but accurately.',
  },
  {
    value: 'sage',
    name: '🧙 Mędrzec',
    prompt: 'You are a calm, wise sage who answers thoughtfully with gentle wisdom.',
  },
];

export const data = new SlashCommandBuilder()
  .setName('persona')
  .setDescription('Osobowość bota AI (styl odpowiedzi /ai, /ask).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((s) =>
    s
      .setName('set')
      .setDescription('Wybierz gotową osobowość.')
      .addStringOption((o) =>
        o
          .setName('styl')
          .setDescription('Osobowość')
          .setRequired(true)
          .addChoices(...PRESETS.map((p) => ({ name: p.name, value: p.value }))),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('custom')
      .setDescription('Ustaw własną osobowość (tekst).')
      .addStringOption((o) =>
        o
          .setName('opis')
          .setDescription('Opisz osobowość bota')
          .setRequired(true)
          .setMaxLength(500),
      ),
  )
  .addSubcommand((s) => s.setName('off').setDescription('Wyłącz osobowość (neutralny ton).'))
  .addSubcommand((s) => s.setName('show').setDescription('Pokaż aktualną osobowość.'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply({
      content: t(locale, 'persona.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const sub = interaction.options.getSubcommand(true);
  const cfg = aiConfig();

  if (sub === 'set') {
    const value = interaction.options.getString('styl', true);
    const preset = PRESETS.find((p) => p.value === value);
    const persona = preset ? preset.prompt + LANG_SUFFIX : '';
    setSetting('ai_config', JSON.stringify({ ...cfg, persona }));
    await interaction.reply({ content: t(locale, 'persona.set'), flags: MessageFlags.Ephemeral });
    return;
  }

  if (sub === 'custom') {
    const opis = interaction.options.getString('opis', true).trim();
    setSetting('ai_config', JSON.stringify({ ...cfg, persona: opis + LANG_SUFFIX }));
    await interaction.reply({ content: t(locale, 'persona.set'), flags: MessageFlags.Ephemeral });
    return;
  }

  if (sub === 'off') {
    setSetting('ai_config', JSON.stringify({ ...cfg, persona: '' }));
    await interaction.reply({ content: t(locale, 'persona.off'), flags: MessageFlags.Ephemeral });
    return;
  }

  // show
  const current = cfg.persona?.trim();
  if (!current) {
    await interaction.reply({
      content: t(locale, 'persona.showNone'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, 'persona.show'))
    .setDescription(current.slice(0, 1000));
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
