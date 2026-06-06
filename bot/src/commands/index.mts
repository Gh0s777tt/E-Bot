import type { ChatInputCommandInteraction } from 'discord.js';
import * as ai from './ai.mts';
import * as antinuke from './antinuke.mts';
import * as buttonpanel from './buttonpanel.mts';
import * as giveaway from './giveaway.mts';
import * as library from './library.mts';
import * as link from './link.mts';
import * as mod from './mod.mts';
import * as ping from './ping.mts';
import * as portal from './portal.mts';
import * as remind from './remind.mts';
import * as ticket from './ticket.mts';
import * as wishlist from './wishlist.mts';

export type Command = {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export const commands: Command[] = [
  ping,
  library,
  antinuke,
  link,
  portal,
  ticket,
  ai,
  mod,
  remind,
  giveaway,
  buttonpanel,
  wishlist,
];
