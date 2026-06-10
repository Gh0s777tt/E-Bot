// /streamsync — Twitch Schedule → wydarzenia Discord (Etap I). Włącz/wyłącz/status;
// login domyślnie z env TWITCH_CHANNEL. Po włączeniu sync rusza od razu. Perm: ManageGuild.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import {
  getSyncConfig,
  hasTwitchCreds,
  setScheduleSync,
  syncedCount,
  syncNow,
} from '../creator/scheduleSync.mts';
import { resolveLocale, t } from '../i18n/index.mts';

export const data = new SlashCommandBuilder()
  .setName('streamsync')
  .setDescription('Harmonogram Twitch → wydarzenia Discord.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((o) =>
    o
      .setName('stan')
      .setDescription('Włącz, wyłącz lub status')
      .setRequired(true)
      .addChoices(
        { name: '📅 ON', value: 'on' },
        { name: '✅ OFF', value: 'off' },
        { name: 'ℹ️ STATUS', value: 'status' },
      ),
  )
  .addStringOption((o) =>
    o.setName('login').setDescription('Kanał Twitch (domyślnie z konfiguracji)').setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply({
      content: t(locale, 'sticky.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const stan = interaction.options.getString('stan', true);
  const loginOpt = interaction.options.getString('login') ?? undefined;

  if (stan === 'status') {
    const cfg = getSyncConfig();
    const lines = [
      cfg.enabled
        ? t(locale, 'ssync.statusOn', { login: cfg.login || '—', count: String(syncedCount()) })
        : t(locale, 'ssync.statusOff'),
    ];
    if (!hasTwitchCreds()) lines.push(t(locale, 'ssync.noCreds'));
    await interaction.reply({ content: lines.join('\n'), flags: MessageFlags.Ephemeral });
    return;
  }

  if (stan === 'off') {
    setScheduleSync(false);
    await interaction.reply({ content: t(locale, 'ssync.off') });
    return;
  }

  const cfg = setScheduleSync(true, loginOpt);
  if (!cfg.login) {
    setScheduleSync(false);
    await interaction.reply({ content: t(locale, 'ssync.noLogin'), flags: MessageFlags.Ephemeral });
    return;
  }
  const lines = [t(locale, 'ssync.on', { login: cfg.login })];
  if (!hasTwitchCreds()) lines.push(t(locale, 'ssync.noCreds'));
  await interaction.reply({ content: lines.join('\n') });
  void syncNow(interaction.client);
}
