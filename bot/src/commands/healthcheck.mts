// /healthcheck — audyt bezpieczeństwa i konfiguracji serwera (Architekt v2 — health-check).
// Czyta stan z Discord API (bez zapisów), liczy wynik i wypisuje kartę z ✅/⚠️/❌. Perm: ManageGuild.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  GuildDefaultMessageNotifications,
  GuildExplicitContentFilter,
  GuildMFALevel,
  GuildVerificationLevel,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const OK = '✅';
const WARN = '⚠️';
const BAD = '❌';
const INFO = '➖';

// Uprawnienia, których @everyone mieć NIE powinien (ryzyko nadużyć).
const DANGEROUS = [
  PermissionFlagsBits.Administrator,
  PermissionFlagsBits.ManageGuild,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.KickMembers,
  PermissionFlagsBits.BanMembers,
  PermissionFlagsBits.ManageWebhooks,
  PermissionFlagsBits.MentionEveryone,
];
const VERIF = ['None', 'Low', 'Medium', 'High', 'Highest'];

type Check = { name: string; value: string; scored: boolean; pass: boolean };

export const data = new SlashCommandBuilder()
  .setName('healthcheck')
  .setDescription('Audyt bezpieczeństwa i konfiguracji serwera.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

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
  await interaction.deferReply();

  const checks: Check[] = [];
  const push = (
    name: string,
    emoji: string,
    detail: string,
    scored: boolean,
    pass: boolean,
  ): void => {
    checks.push({ name, value: detail ? `${emoji} ${detail}` : emoji, scored, pass });
  };

  // 1) Poziom weryfikacji — OK przy ≥ Medium
  const vOk = guild.verificationLevel >= GuildVerificationLevel.Medium;
  push(
    t(locale, 'health.verification'),
    vOk ? OK : WARN,
    VERIF[guild.verificationLevel] ?? '?',
    true,
    vOk,
  );

  // 2) Filtr treści (skan mediów) — OK gdy włączony
  const cOk = guild.explicitContentFilter !== GuildExplicitContentFilter.Disabled;
  push(t(locale, 'health.content'), cOk ? OK : WARN, cOk ? 'ON' : 'OFF', true, cOk);

  // 3) Uprawnienia @everyone — źle, jeśli ma ryzykowne
  const danger = DANGEROUS.filter((p) => guild.roles.everyone.permissions.has(p));
  const pOk = danger.length === 0;
  push(t(locale, 'health.perms'), pOk ? OK : BAD, pOk ? '' : `${danger.length}`, true, pOk);

  // 4) 2FA dla moderacji
  const mOk = guild.mfaLevel === GuildMFALevel.Elevated;
  push(t(locale, 'health.mfa'), mOk ? OK : WARN, mOk ? 'ON' : 'OFF', true, mOk);

  // 5) Domyślne powiadomienia — OK gdy „tylko wzmianki"
  const nOk = guild.defaultMessageNotifications === GuildDefaultMessageNotifications.OnlyMentions;
  push(t(locale, 'health.notify'), nOk ? OK : WARN, nOk ? '@only' : 'all', true, nOk);

  // 6) Pozycja roli bota — OK, gdy w górnej 1/3 (bot może moderować większość)
  const total = guild.roles.cache.size;
  const pos = guild.members.me?.roles.highest.position ?? 0;
  const bOk = total <= 1 ? true : pos >= (total - 1) * 0.66;
  push(t(locale, 'health.botRole'), bOk ? OK : WARN, '', true, bOk);

  // 7) Kanał zasad — informacyjnie
  const rHas = Boolean(guild.rulesChannelId);
  push(t(locale, 'health.rules'), rHas ? OK : INFO, '', false, rHas);

  // 8) Tryb społeczności — informacyjnie
  const comm = guild.features.includes('COMMUNITY');
  push(t(locale, 'health.community'), comm ? OK : INFO, '', false, comm);

  const scored = checks.filter((c) => c.scored);
  const passed = scored.filter((c) => c.pass).length;
  const score = Math.round((passed / scored.length) * 100);
  const summaryKey =
    score >= 85 ? 'health.scoreGood' : score >= 55 ? 'health.scoreWarn' : 'health.scoreBad';
  const color = score >= 85 ? 0x2ecc71 : score >= 55 ? 0xe5a50a : 0xe50914;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(t(locale, 'health.title'))
    .setDescription(`**${score}/100**\n${t(locale, summaryKey)}`)
    .addFields(checks.map((c) => ({ name: c.name, value: c.value, inline: true })));
  const icon = guild.iconURL({ size: 128 });
  if (icon) embed.setThumbnail(icon);

  await interaction.editReply({ embeds: [embed] });
}
