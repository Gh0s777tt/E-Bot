// /afk — ustaw status AFK (czyszczony przy następnej wiadomości; wzmianka informuje innych).
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { afkEnabled, setAfk } from '../community/afk.mts';
import { resolveLocale, t } from '../i18n/index.mts';

export const data = new SlashCommandBuilder()
  .setName('afk')
  .setDescription('Ustaw swój status AFK.')
  .addStringOption((o) =>
    o.setName('powod').setDescription('Powód (opcjonalnie)').setMaxLength(200),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!afkEnabled()) {
    await interaction.reply({ content: t(locale, 'afk.disabled'), flags: MessageFlags.Ephemeral });
    return;
  }
  const reason = interaction.options.getString('powod') ?? 'AFK';
  setAfk(interaction.user.id, reason);
  await interaction.reply({
    content: t(locale, 'afk.set', { reason }),
    flags: MessageFlags.Ephemeral,
  });
}
