// /rps — kamień, papier, nożyce z botem. Czysta logika (bez API).
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;
export const CHOICES = ['rock', 'paper', 'scissors'] as const;
export type Choice = (typeof CHOICES)[number];
const BEATS: Record<Choice, Choice> = { rock: 'scissors', scissors: 'paper', paper: 'rock' };

// Wynik rundy z perspektywy gracza. Jedyne źródło prawdy o zwycięstwie (execute go używa).
export function rpsOutcome(you: Choice, bot: Choice): 'tie' | 'win' | 'lose' {
  return you === bot ? 'tie' : BEATS[you] === bot ? 'win' : 'lose';
}

export const data = new SlashCommandBuilder()
  .setName('rps')
  .setDescription('Kamień, papier, nożyce z botem.')
  .addStringOption((o) =>
    o
      .setName('wybor')
      .setDescription('Twój wybór')
      .setRequired(true)
      .addChoices(
        { name: 'Kamień 🪨', value: 'rock' },
        { name: 'Papier 📄', value: 'paper' },
        { name: 'Nożyce ✂️', value: 'scissors' },
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const you = interaction.options.getString('wybor', true) as Choice;
  const bot = CHOICES[Math.floor(Math.random() * CHOICES.length)];
  const resultKey = `rps.${rpsOutcome(you, bot)}`;
  const label = (c: Choice): string => t(locale, `rps.${c}`);
  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, 'rps.title'))
    .setDescription(
      `${t(locale, 'rps.fYou')}: ${label(you)}\n${t(locale, 'rps.fBot')}: ${label(bot)}\n\n**${t(locale, resultKey)}**`,
    );
  await interaction.reply({ embeds: [embed] });
}
