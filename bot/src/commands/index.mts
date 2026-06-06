import type { ChatInputCommandInteraction } from 'discord.js';
import * as ping from './ping.mts';
import * as library from './library.mts';
import * as antinuke from './antinuke.mts';

export type Command = {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export const commands: Command[] = [ping, library, antinuke];
