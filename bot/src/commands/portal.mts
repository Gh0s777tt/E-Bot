// /portal — link to the GH0ST EMPIRE site + how to earn Ghost Tokens on Discord.
import { SlashCommandBuilder, EmbedBuilder, MessageFlags, type ChatInputCommandInteraction } from "discord.js";

const GHOST_URL = process.env.GHOST_API_URL || "https://ghost-empire-web.vercel.app";

export const data = new SlashCommandBuilder()
  .setName("portal")
  .setDescription("Portal GH0ST EMPIRE + jak zarabiać Ghost Tokens na Discordzie.");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle("🌐 GH0ST EMPIRE")
    .setURL(GHOST_URL)
    .setDescription(
      [
        `Portal: ${GHOST_URL}`,
        "",
        "**Jak zdobywać Ghost Tokens (GT) na Discordzie:**",
        "▸ Pisz na czacie i siedź na voice — GT lecą automatycznie.",
        "▸ `/link` — powiąż konto Discord z profilem na portalu (bez tego GT nie naliczą się).",
        "▸ Drop code'y, daily questy, sklep i mini-gry znajdziesz na stronie.",
      ].join("\n"),
    );
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
