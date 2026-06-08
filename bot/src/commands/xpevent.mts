// /xpevent — admin włącza/wyłącza globalny event podwójnego XP (czasowy mnożnik w levelingu).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { getXpEvent, setXpEvent } from '../leveling.mts';

const ACCENT = 0xe50914;
const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });

export const data = new SlashCommandBuilder()
  .setName('xpevent')
  .setDescription('Event podwójnego XP (tylko admin).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((s) =>
    s
      .setName('start')
      .setDescription('Włącz mnożnik XP na określony czas')
      .addIntegerOption((o) =>
        o
          .setName('mnoznik')
          .setDescription('Ile razy więcej XP')
          .setRequired(true)
          .addChoices({ name: 'x2', value: 2 }, { name: 'x3', value: 3 }),
      )
      .addIntegerOption((o) =>
        o
          .setName('minuty')
          .setDescription('Czas trwania (1–1440 min)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(1440),
      ),
  )
  .addSubcommand((s) => s.setName('stop').setDescription('Wyłącz event XP'))
  .addSubcommand((s) => s.setName('status').setDescription('Stan eventu XP'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply(
      eph('Tylko administrator (Zarządzanie serwerem) może użyć tej komendy.'),
    );
    return;
  }
  const sub = interaction.options.getSubcommand();

  if (sub === 'start') {
    const mult = interaction.options.getInteger('mnoznik', true);
    const mins = interaction.options.getInteger('minuty', true);
    await setXpEvent(mult, mins);
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle('⚡ DOUBLE-XP EVENT!')
      .setDescription(
        `Od teraz **x${mult} XP** za czat i voice przez **${mins} min**!\nZałap aktywność, póki trwa. 🔥`,
      );
    await interaction.reply({ embeds: [embed] });
    return;
  }

  if (sub === 'stop') {
    await setXpEvent(1, 0);
    await interaction.reply(eph('⏹️ Event XP wyłączony.'));
    return;
  }

  const e = getXpEvent();
  if (e.until > Date.now() && e.mult > 1) {
    const left = Math.ceil((e.until - Date.now()) / 60_000);
    await interaction.reply(eph(`⚡ Aktywny event: x${e.mult} XP, zostało ~${left} min.`));
  } else {
    await interaction.reply(eph('Brak aktywnego eventu XP. Włącz: /xpevent start'));
  }
}
