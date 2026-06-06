import type { ChatInputCommandInteraction } from 'discord.js';
import * as ping from './ping.mts';
import * as library from './library.mts';
import * as antinuke from './antinuke.mts';
import * as link from './link.mts';
import * as portal from './portal.mts';
import * as ticket from './ticket.mts';
import * as ai from './ai.mts';

export type Command = {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export const commands: Command[] = [ping, library, antinuke, link, portal, ticket, ai];
