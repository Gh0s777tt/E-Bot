// Faza 8 — /ask: jednorazowe pytanie do AI (bez pamięci, z personą). Wspólne limity ai_usage.
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { aiConfig, bumpUsage, callModel, checkUsage } from '../lib/ai.mts';
import { panelButtonRow } from '../lib/panelLink.mts';

export const data = new SlashCommandBuilder()
  .setName('ask')
  .setDescription('Zadaj jednorazowe pytanie AI (bez pamięci).')
  .addStringOption((o) =>
    o.setName('pytanie').setDescription('Twoje pytanie').setRequired(true).setMaxLength(1500),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cfg = aiConfig();
  if (!cfg.enabled) {
    const locale = resolveLocale(interaction);
    await interaction.reply({
      content: t(locale, 'panel.aiOff'),
      components: panelButtonRow('/ai', t(locale, 'panel.open')),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.deferReply();
  const usage = await checkUsage(interaction.user.id, interaction.guildId ?? '', cfg);
  if (usage.limited) {
    await interaction.editReply(usage.limited);
    return;
  }
  const pytanie = interaction.options.getString('pytanie', true);
  const system = `${cfg.persona ? `${cfg.persona}\n\n` : ''}Odpowiadaj zwięźle, rzeczowo i po polsku.`;
  try {
    const { text, tokens } = await callModel(
      cfg.model,
      [
        { role: 'system', content: system },
        { role: 'user', content: pytanie },
      ],
      800,
    );
    await bumpUsage(interaction.user.id, usage, tokens);
    await interaction.editReply(text.slice(0, 1900) || '—');
  } catch (e) {
    await interaction.editReply(`😵 Błąd AI: ${(e as Error).message}`);
  }
}
