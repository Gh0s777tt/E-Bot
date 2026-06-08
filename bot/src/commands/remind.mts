// /remind — przypomnienie po zadanym czasie. Zapis do Supabase 'reminders'; poller wysyła gdy nadejdzie.
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { cloudInsert, hasCloud } from '../lib/cloud.mts';
import { formatDuration, parseDuration } from '../lib/duration.mts';

export const data = new SlashCommandBuilder()
  .setName('remind')
  .setDescription('Przypomnienie po zadanym czasie.')
  .addStringOption((o) =>
    o.setName('kiedy').setDescription('np. 10m, 2h, 1d, 1h30m').setRequired(true),
  )
  .addStringOption((o) =>
    o.setName('tresc').setDescription('Co przypomnieć?').setRequired(true).setMaxLength(500),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const when = interaction.options.getString('kiedy', true);
  const text = interaction.options.getString('tresc', true);
  const ms = parseDuration(when);
  if (!ms) {
    await interaction.reply({
      content: t(locale, 'remind.badFormat'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: t(locale, 'remind.needCloud'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await cloudInsert('reminders', [
    {
      user_id: interaction.user.id,
      channel_id: interaction.channelId,
      guild_id: interaction.guildId,
      message: text,
      remind_at: new Date(Date.now() + ms).toISOString(),
    },
  ]);
  await interaction.reply({
    content: t(locale, 'remind.set', { duration: formatDuration(ms), text }),
    flags: MessageFlags.Ephemeral,
  });
}
