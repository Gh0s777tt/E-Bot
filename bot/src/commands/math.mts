// /math — kalkulator. Bez eval na surowym wejściu: twardy filtr znaków (tylko arytmetyka),
// limit długości, wynik musi być skończoną liczbą.
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

export const data = new SlashCommandBuilder()
  .setName('math')
  .setDescription('Kalkulator — policz wyrażenie (np. 2*(3+4)/7).')
  .addStringOption((o) =>
    o.setName('wyrazenie').setDescription('Co policzyć?').setRequired(true).setMaxLength(100),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const raw = interaction.options.getString('wyrazenie', true);
  const expr = raw.replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-').trim();
  if (!/^[0-9+\-*/().%\s]+$/.test(expr) || expr.length === 0) {
    await interaction.reply({ content: t(locale, 'math.invalid'), flags: MessageFlags.Ephemeral });
    return;
  }
  try {
    const value = new Function(`"use strict"; return (${expr});`)() as unknown;
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('not finite');
    const result = String(Math.round(value * 1e10) / 1e10);
    await interaction.reply(t(locale, 'math.result', { expr: raw, result }));
  } catch {
    await interaction.reply({ content: t(locale, 'math.invalid'), flags: MessageFlags.Ephemeral });
  }
}
