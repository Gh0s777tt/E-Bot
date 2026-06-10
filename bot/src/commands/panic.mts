// /panic — jednoprzyciskowa twierdza (Etap G, finał): lockdown WSZYSTKICH kanałów + raidmode
// (kick nowych wejść) jednym ruchem. Spina istniejące klocki: applyLockdown + setRaidmode.
// Po ataku: /backup restore odbudowuje zniszczenia. Perm: Administrator.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { setRaidmode } from '../security/antiraid.mts';
import { applyLockdown } from './lockdown.mts';

export const data = new SlashCommandBuilder()
  .setName('panic')
  .setDescription('PANIC MODE — lockdown całego serwera + blokada wejść jednym ruchem.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((o) =>
    o
      .setName('stan')
      .setDescription('Włącz lub wyłącz')
      .setRequired(true)
      .addChoices({ name: '🚨 ON', value: 'on' }, { name: '✅ OFF', value: 'off' }),
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
  const on = interaction.options.getString('stan', true) === 'on';
  await interaction.deferReply();
  setRaidmode(on);
  const channels = await applyLockdown(
    guild,
    on,
    on ? 'PANIC MODE — blokada awaryjna' : 'PANIC MODE — odwołanie',
  );
  await interaction.editReply({
    content: t(locale, on ? 'panic.on' : 'panic.off', { channels: String(channels) }),
  });
}
