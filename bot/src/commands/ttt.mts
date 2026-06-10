// /ttt — kółko i krzyżyk 1v1 na przyciskach. Stan gier w pamięci (TTL 10 min); routing 'ttt:'
// w dispatcherze. Wyzwanie publiczne — gra toczy się w jednej wiadomości (update).
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveGuildLocale, resolveLocale, t } from '../i18n/index.mts';

type Cell = 0 | 1 | 2; // 0 puste, 1 = ❌ (wyzywający), 2 = ⭕ (przeciwnik)
type Game = {
  board: Cell[];
  players: [string, string];
  turn: 0 | 1;
  timer: ReturnType<typeof setTimeout>;
};

const games = new Map<string, Game>();
const MARKS = ['·', '❌', '⭕'] as const;
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function winner(board: Cell[]): Cell {
  for (const [a, b, c] of LINES) {
    if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  return 0;
}

function grid(id: string, board: Cell[], done: boolean): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (let c = 0; c < 3; c++) {
      const i = r * 3 + c;
      const cell = board[i];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ttt:${id}:${i}`)
          .setLabel(MARKS[cell])
          .setStyle(
            cell === 1
              ? ButtonStyle.Danger
              : cell === 2
                ? ButtonStyle.Primary
                : ButtonStyle.Secondary,
          )
          .setDisabled(done || cell !== 0),
      );
    }
    rows.push(row);
  }
  return rows;
}

function header(game: Game): string {
  const gLocale = resolveGuildLocale();
  const vs = t(gLocale, 'ttt.vs', { x: `<@${game.players[0]}>`, o: `<@${game.players[1]}>` });
  return `${vs}\n${t(gLocale, 'ttt.turn', { user: `<@${game.players[game.turn]}>` })}`;
}

export const data = new SlashCommandBuilder()
  .setName('ttt')
  .setDescription('Kółko i krzyżyk z innym graczem. ⭕❌')
  .addUserOption((o) => o.setName('przeciwnik').setDescription('Z kim grasz?').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const target = interaction.options.getUser('przeciwnik', true);
  if (target.id === interaction.user.id || target.bot) {
    await interaction.reply({ content: t(locale, 'ttt.selfOrBot'), flags: MessageFlags.Ephemeral });
    return;
  }
  const id = interaction.id;
  const game: Game = {
    board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    players: [interaction.user.id, target.id],
    turn: 0,
    timer: setTimeout(() => games.delete(id), 10 * 60_000),
  };
  games.set(id, game);
  await interaction.reply({ content: header(game), components: grid(id, game.board, false) });
}

export async function handleTttButton(interaction: ButtonInteraction): Promise<void> {
  const [, id, cellRaw] = interaction.customId.split(':');
  const locale = resolveLocale(interaction);
  const game = id ? games.get(id) : undefined;
  if (!game || !id) {
    await interaction.reply({ content: t(locale, 'ttt.expired'), flags: MessageFlags.Ephemeral });
    return;
  }
  const uid = interaction.user.id;
  if (!game.players.includes(uid)) {
    await interaction.reply({ content: t(locale, 'ttt.notPlayer'), flags: MessageFlags.Ephemeral });
    return;
  }
  if (uid !== game.players[game.turn]) {
    await interaction.reply({
      content: t(locale, 'ttt.notYourTurn'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const cell = Number(cellRaw);
  if (!Number.isInteger(cell) || cell < 0 || cell > 8 || game.board[cell] !== 0) {
    await interaction.deferUpdate();
    return;
  }

  game.board[cell] = (game.turn + 1) as Cell;
  const won = winner(game.board);
  const full = game.board.every((c) => c !== 0);
  const gLocale = resolveGuildLocale();
  const vs = t(gLocale, 'ttt.vs', { x: `<@${game.players[0]}>`, o: `<@${game.players[1]}>` });

  if (won || full) {
    clearTimeout(game.timer);
    games.delete(id);
    const ending = won
      ? t(gLocale, 'ttt.win', { user: `<@${game.players[won - 1]}>` })
      : t(gLocale, 'ttt.draw');
    await interaction.update({
      content: `${vs}\n${ending}`,
      components: grid(id, game.board, true),
    });
    return;
  }

  game.turn = game.turn === 0 ? 1 : 0;
  await interaction.update({ content: header(game), components: grid(id, game.board, false) });
}
