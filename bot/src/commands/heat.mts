// /heat — adaptacyjny anty-spam (heat system): on/off/status. Config w 'heat_config'
// (setHeatConfig = zmiana natychmiastowa + persist). Perm: ManageGuild.
import {
  ChannelType,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { getHeatConfig, setHeatConfig } from '../security/heat.mts';

export const data = new SlashCommandBuilder()
  .setName('heat')
  .setDescription('Adaptacyjny anty-spam (heat) — scoring z karą.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((s) =>
    s
      .setName('on')
      .setDescription('Włącz heat system.')
      .addIntegerOption((o) =>
        o
          .setName('prog')
          .setDescription('Próg ciepła (domyślnie 20)')
          .setMinValue(5)
          .setMaxValue(100),
      )
      .addStringOption((o) =>
        o
          .setName('akcja')
          .setDescription('Kara po przekroczeniu progu (domyślnie timeout)')
          .addChoices(
            { name: '⏳ Timeout 10 min', value: 'timeout' },
            { name: '👢 Kick', value: 'kick' },
          ),
      )
      .addChannelOption((o) =>
        o
          .setName('alerty')
          .setDescription('Kanał alertów (opcjonalnie)')
          .addChannelTypes(ChannelType.GuildText),
      ),
  )
  .addSubcommand((s) => s.setName('off').setDescription('Wyłącz heat system.'))
  .addSubcommand((s) => s.setName('status').setDescription('Pokaż aktualne ustawienia.'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply({
      content: t(locale, 'sticky.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const sub = interaction.options.getSubcommand(true);

  if (sub === 'on') {
    const threshold = interaction.options.getInteger('prog') ?? 20;
    const action = (interaction.options.getString('akcja') ?? 'timeout') as 'timeout' | 'kick';
    const alerts = interaction.options.getChannel('alerty');
    const cfg = setHeatConfig({
      enabled: true,
      threshold,
      action,
      ...(alerts ? { alertChannelId: alerts.id } : {}),
    });
    await interaction.reply({
      content: t(locale, 'heat.on', { threshold: String(cfg.threshold), action: cfg.action }),
    });
    return;
  }

  if (sub === 'off') {
    setHeatConfig({ enabled: false });
    await interaction.reply({ content: t(locale, 'heat.off') });
    return;
  }

  const cfg = getHeatConfig();
  await interaction.reply({
    content: cfg.enabled
      ? t(locale, 'heat.statusOn', { threshold: String(cfg.threshold), action: cfg.action })
      : t(locale, 'heat.statusOff'),
    flags: MessageFlags.Ephemeral,
  });
}
