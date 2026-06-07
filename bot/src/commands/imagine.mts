// /imagine — generowanie obrazu z opisu (OpenAI dall-e-3). Pod wspólnym dziennym limitem (ai_usage).
import {
  AttachmentBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { aiConfig, bumpUsage, checkUsage, generateImage } from '../lib/ai.mts';

export const data = new SlashCommandBuilder()
  .setName('imagine')
  .setDescription('Wygeneruj obraz z opisu (AI / OpenAI).')
  .addStringOption((o) =>
    o.setName('opis').setDescription('Co narysować').setRequired(true).setMaxLength(1000),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cfg = aiConfig();
  if (!cfg.enabled) {
    await interaction.reply({
      content: '🤖 Komendy AI są wyłączone (włącz w panelu).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.deferReply();

  const usage = await checkUsage(interaction.user.id, cfg);
  if (usage.limited) {
    await interaction.editReply(usage.limited);
    return;
  }

  const prompt = interaction.options.getString('opis', true);
  try {
    const buf = await generateImage(prompt);
    await bumpUsage(interaction.user.id, usage, 1000); // proxy kosztu obrazu na potrzeby limitu
    const file = new AttachmentBuilder(buf, { name: 'imagine.png' });
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle(`🎨 ${prompt.slice(0, 200)}`)
      .setImage('attachment://imagine.png')
      .setFooter({ text: `/imagine • ${interaction.user.username}` })
      .setTimestamp(new Date());
    await interaction.editReply({ embeds: [embed], files: [file] });
  } catch (e) {
    await interaction.editReply(`😵 Błąd generowania obrazu: ${(e as Error).message}`);
  }
}
