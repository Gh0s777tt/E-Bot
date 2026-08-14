// Integracja z E-Forge — łączenie konta Discord z profilem na stronie.
// Flow: użytkownik bierze 6-znakowy kod na stronie E-Forge, podaje go w /link,
// bot woła POST /api/internal/link-discord (Authorization: Bearer BOT_SECRET).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { ghostUrl } from '../empire/config.mts';

export const data = new SlashCommandBuilder()
  .setName('link')
  .setDescription('Połącz konto Discord z profilem E-Forge.')
  .addStringOption((o) =>
    o
      .setName('kod')
      .setDescription('6-znakowy kod ze strony E-Forge')
      .setRequired(true)
      .setMinLength(6)
      .setMaxLength(6),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  // Bramka: adres portalu ORAZ sekret. Puste GHOST_API_URL to udokumentowany stan „integracja
  // wyłączona" — bez tego warunku kod leciał na zaszyty fallback i wysyłał `Bearer <sekret>`
  // razem z discordId/username użytkownika do cudzego deploymentu Vercel. Ten sam komunikat co
  // dotąd (żadnego nowego klucza i18n), tylko nazwa brakującej zmiennej jest prawdziwa.
  const base = ghostUrl();
  const secret = process.env.GHOST_BOT_SECRET;
  if (!base || !secret) {
    const missing = base ? 'GHOST_BOT_SECRET' : 'GHOST_API_URL';
    await interaction.reply({
      content: `⚠️ Integracja E-Forge nie jest skonfigurowana (brak \`${missing}\`).`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const code = interaction.options.getString('kod', true).toUpperCase().trim();
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const r = await fetch(`${base}/api/internal/link-discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({
        code,
        discordId: interaction.user.id,
        discordUsername: interaction.user.username,
      }),
    });
    const data = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };

    if (r.ok && data.ok) {
      const embed = new EmbedBuilder()
        .setColor(0xe50914)
        .setTitle('✅ Połączono z E-Forge')
        .setDescription('Twoje konto Discord jest teraz powiązane z profilem na stronie E-Forge.');
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply(
        `❌ ${data.error || `Nie udało się połączyć (HTTP ${r.status}).`}`,
      );
    }
  } catch (e) {
    await interaction.editReply(`❌ Błąd połączenia z E-Forge: ${(e as Error).message}`);
  }
}
