// /highlight — rejestruj słowa, na które bot wyśle Ci DM, gdy padną w czacie (community/highlights.mts).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { cloudDelete, cloudInsert, cloudSelect, hasCloud } from '../lib/cloud.mts';

const MAX = 25;

export const data = new SlashCommandBuilder()
  .setName('highlight')
  .setDescription('Powiadomienia DM o słowach-kluczach w czacie.')
  .addSubcommand((s) =>
    s
      .setName('add')
      .setDescription('Dodaj słowo')
      .addStringOption((o) =>
        o
          .setName('slowo')
          .setDescription('Słowo-klucz')
          .setRequired(true)
          .setMinLength(2)
          .setMaxLength(50),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('remove')
      .setDescription('Usuń słowo')
      .addStringOption((o) =>
        o.setName('slowo').setDescription('Słowo-klucz').setRequired(true).setMaxLength(50),
      ),
  )
  .addSubcommand((s) => s.setName('list').setDescription('Pokaż Twoje słowa'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Highlighty wymagają chmury (Supabase + _ALL.sql).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const sub = interaction.options.getSubcommand();
  const filter = `guild_id=eq.${interaction.guildId}&user_id=eq.${interaction.user.id}`;

  if (sub === 'list') {
    const rows = await cloudSelect<{ word: string }>('highlights', `select=word&${filter}`);
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle('🔔 Twoje highlighty')
      .setDescription(rows.length ? rows.map((r) => `• ${r.word}`).join('\n') : 'Brak słów.');
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  const word = interaction.options.getString('slowo', true).trim();

  if (sub === 'remove') {
    await cloudDelete('highlights', `${filter}&word=eq.${encodeURIComponent(word)}`).catch(
      () => {},
    );
    await interaction.reply({ content: `🗑️ Usunięto: **${word}**`, flags: MessageFlags.Ephemeral });
    return;
  }

  // add
  const rows = await cloudSelect<{ word: string }>('highlights', `select=word&${filter}`);
  if (rows.length >= MAX) {
    await interaction.reply({
      content: `❌ Limit ${MAX} słów. Usuń coś przez /highlight remove.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (rows.some((r) => r.word.toLowerCase() === word.toLowerCase())) {
    await interaction.reply({ content: 'To słowo już masz.', flags: MessageFlags.Ephemeral });
    return;
  }
  await cloudInsert('highlights', [
    { guild_id: interaction.guildId, user_id: interaction.user.id, word },
  ]).catch((e) => console.warn('[highlight]', (e as Error).message));
  await interaction.reply({ content: `🔔 Dodano: **${word}**`, flags: MessageFlags.Ephemeral });
}
