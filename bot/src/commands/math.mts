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

// Bezpieczna ewaluacja wyrażenia: normalizacja symboli (×÷−), TWARDY whitelist znaków (tylko
// arytmetyka — bez liter ⇒ brak dostępu do globali / injection przez `new Function`), wynik MUSI być
// skończoną liczbą (odcina 1/0→Infinity, 0/0→NaN), zaokrąglenie tnie szum zmiennoprzecinkowy.
// Zwraca sformatowany wynik albo `null` (= odrzucone). Regresja = RCE lub „Infinity"/„NaN" w odpowiedzi.
export function safeEval(raw: string): string | null {
  const expr = raw.replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-').trim();
  if (!/^[0-9+\-*/().%\s]+$/.test(expr) || expr.length === 0) return null;
  try {
    const value = new Function(`"use strict"; return (${expr});`)() as unknown;
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return String(Math.round(value * 1e10) / 1e10);
  } catch {
    return null;
  }
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const raw = interaction.options.getString('wyrazenie', true);
  const result = safeEval(raw);
  if (result === null) {
    await interaction.reply({ content: t(locale, 'math.invalid'), flags: MessageFlags.Ephemeral });
    return;
  }
  await interaction.reply(t(locale, 'math.result', { expr: raw, result }));
}
