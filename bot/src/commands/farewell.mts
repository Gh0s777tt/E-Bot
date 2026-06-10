// /farewell — pożegnania (goodbye) i podziękowania za boost (booster). Perm: ManageGuild.
// Sterowanie slash-komendą (jak /sticky); moduł farewell.mts czyta settings i nasłuchuje zdarzeń.
import {
  ChannelType,
  type ChatInputCommandInteraction,
  type GuildTextBasedChannel,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import {
  FAREWELL_ACCENT,
  FAREWELL_BOOST,
  type FarewellConfig,
  farewellEmbed,
  memberVars,
  renderVars,
} from '../farewell.mts';
import { resolveLocale, t } from '../i18n/index.mts';
import { getSettings, setSetting } from '../lib/db.mts';

const TEXT_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement] as const;
const VARS_HINT = 'Treść. Zmienne: {user} {username} {server} {memberCount}';

function group(name: 'goodbye' | 'booster') {
  return (g: SlashCommandSubcommandGroupBuilder) =>
    g
      .setName(name)
      .setDescription(
        name === 'goodbye'
          ? 'Wiadomości pożegnalne (gdy ktoś wychodzi).'
          : 'Podziękowania za boost serwera.',
      )
      .addSubcommand((s) => {
        s.setName('set')
          .setDescription('Ustaw kanał i treść wiadomości.')
          .addChannelOption((o) =>
            o
              .setName('kanal')
              .setDescription('Kanał docelowy')
              .addChannelTypes(...TEXT_TYPES)
              .setRequired(true),
          )
          .addStringOption((o) =>
            o.setName('tekst').setDescription(VARS_HINT).setRequired(true).setMaxLength(1000),
          );
        if (name === 'booster') {
          s.addRoleOption((o) =>
            o.setName('rola').setDescription('Rola nadawana boosterom (opcjonalnie)'),
          );
        }
        return s;
      })
      .addSubcommand((s) => s.setName('off').setDescription('Wyłącz te wiadomości.'))
      .addSubcommand((s) => s.setName('test').setDescription('Wyślij testową wiadomość na kanał.'));
}

export const data = new SlashCommandBuilder()
  .setName('farewell')
  .setDescription('Pożegnania i podziękowania za boost serwera.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommandGroup(group('goodbye'))
  .addSubcommandGroup(group('booster'));

function readConfig(key: string): FarewellConfig {
  const raw = getSettings()[key];
  if (!raw) return { enabled: false, channelId: '', message: '' };
  try {
    return {
      enabled: false,
      channelId: '',
      message: '',
      ...(JSON.parse(raw) as Partial<FarewellConfig>),
    };
  } catch {
    return { enabled: false, channelId: '', message: '' };
  }
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply({
      content: t(locale, 'farewell.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const grp = interaction.options.getSubcommandGroup(true) as 'goodbye' | 'booster';
  const sub = interaction.options.getSubcommand(true);
  const key = grp === 'booster' ? 'booster_config' : 'goodbye_config';
  const color = grp === 'booster' ? FAREWELL_BOOST : FAREWELL_ACCENT;

  if (sub === 'set') {
    const channel = interaction.options.getChannel('kanal', true);
    const text = interaction.options.getString('tekst', true);
    const cfg: FarewellConfig = { enabled: true, channelId: channel.id, message: text };
    if (grp === 'booster') {
      const role = interaction.options.getRole('rola');
      if (role) cfg.roleId = role.id;
    }
    setSetting(key, JSON.stringify(cfg));
    await interaction.reply({
      content: t(locale, grp === 'booster' ? 'farewell.boosterSet' : 'farewell.goodbyeSet', {
        channel: `<#${channel.id}>`,
      }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (sub === 'off') {
    const cfg = readConfig(key);
    setSetting(key, JSON.stringify({ ...cfg, enabled: false }));
    await interaction.reply({
      content: t(locale, grp === 'booster' ? 'farewell.boosterOff' : 'farewell.goodbyeOff'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // test — wyślij przykład na skonfigurowany kanał (autor jako przykładowy członek)
  const cfg = readConfig(key);
  if (!cfg.channelId || !cfg.message) {
    await interaction.reply({
      content: t(locale, 'farewell.notSet'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const ch = await interaction.guild.channels.fetch(cfg.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) {
    await interaction.reply({
      content: t(locale, 'farewell.cantSend'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const me = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
  const vars = me
    ? memberVars(me)
    : {
        '{user}': `<@${interaction.user.id}>`,
        '{username}': interaction.user.username,
        '{server}': interaction.guild.name,
        '{memberCount}': String(interaction.guild.memberCount),
      };
  const embed = farewellEmbed(
    renderVars(cfg.message, vars),
    color,
    interaction.user.displayAvatarURL(),
  );
  try {
    await (ch as GuildTextBasedChannel).send({ embeds: [embed] });
    await interaction.reply({
      content: t(locale, 'farewell.testSent', { channel: `<#${cfg.channelId}>` }),
      flags: MessageFlags.Ephemeral,
    });
  } catch {
    await interaction.reply({
      content: t(locale, 'farewell.cantSend'),
      flags: MessageFlags.Ephemeral,
    });
  }
}
