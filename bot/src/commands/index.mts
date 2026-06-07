import type { ChatInputCommandInteraction } from 'discord.js';
import * as afk from './afk.mts';
import * as ai from './ai.mts';
import * as antinuke from './antinuke.mts';
import * as backlog from './backlog.mts';
import * as birthday from './birthday.mts';
import * as buttonpanel from './buttonpanel.mts';
import * as caseCmd from './case.mts';
import * as describe from './describe.mts';
import * as economy from './economy.mts';
import * as fun from './fun.mts';
import * as giveaway from './giveaway.mts';
import * as highlight from './highlight.mts';
import * as hof from './hof.mts';
import * as imagine from './imagine.mts';
import * as invites from './invites.mts';
import * as library from './library.mts';
import * as link from './link.mts';
import * as market from './market.mts';
import * as mod from './mod.mts';
import * as ping from './ping.mts';
import * as poll from './poll.mts';
import * as portal from './portal.mts';
import * as prestige from './prestige.mts';
import * as profile from './profile.mts';
import * as quests from './quests.mts';
import * as rank from './rank.mts';
import * as remind from './remind.mts';
import * as rolemenu from './rolemenu.mts';
import * as schedule from './schedule.mts';
import * as suggest from './suggest.mts';
import * as ticket from './ticket.mts';
import * as ticketpanel from './ticketpanel.mts';
import * as tldr from './tldr.mts';
import * as translate from './translate.mts';
import * as verifypanel from './verifypanel.mts';
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
  caseCmd,
  describe,
  remind,
  rolemenu,
  schedule,
  giveaway,
  buttonpanel,
  wishlist,
  rank,
  economy,
  prestige,
  profile,
  quests,
  ticketpanel,
  verifypanel,
  suggest,
  poll,
  birthday,
  afk,
  highlight,
  tldr,
  translate,
  imagine,
  backlog,
  hof,
  fun,
  invites,
  market,
];
