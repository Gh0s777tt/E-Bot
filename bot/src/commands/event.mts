// /event — ogłoszenie wydarzenia z zapisami (RSVP) przez reakcje (✅ idę / 🤔 może / ❌ nie).
// Reakcje przeżywają restart bota i same liczą głosy — bez dodatkowego stanu (wzorzec jak /poll).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

const ACCENT = 0xe50914;
const RSVP = ['✅', '🤔', '❌'];

export const data = new SlashCommandBuilder()
  .setName('event')
  .setDescription('Ogłoś wydarzenie z zapisami (RSVP).')
  .addStringOption((o) =>
    o.setName('tytul').setDescription('Nazwa wydarzenia').setRequired(true).setMaxLength(256),
  )
  .addStringOption((o) =>
    o
      .setName('kiedy')
      .setDescription('Kiedy (np. „sobota 20:00")')
      .setRequired(true)
      .setMaxLength(100),
  )
  .addStringOption((o) =>
    o.setName('opis').setDescription('Dodatkowe szczegóły').setMaxLength(1500),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const title = interaction.options.getString('tytul', true);
  const when = interaction.options.getString('kiedy', true);
  const desc = interaction.options.getString('opis') ?? '';
  const ch = interaction.channel;
  if (!ch || !('send' in ch)) {
    await interaction.reply({
      content: 'Tu nie można ogłosić wydarzenia.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(`📅 ${title}`)
    .setDescription(
      `${desc ? `${desc}\n\n` : ''}🕒 **Kiedy:** ${when}\n\n✅ Idę  ·  🤔 Może  ·  ❌ Nie`,
    )
    .setFooter({
      text: `Organizuje ${interaction.user.username} • zaznacz reakcję, by się zapisać`,
    })
    .setTimestamp(new Date());

  await interaction.reply({ embeds: [embed] });
  const msg = await interaction.fetchReply();
  for (const e of RSVP) await msg.react(e).catch(() => {});
}
