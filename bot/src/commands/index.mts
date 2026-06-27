import type { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import { applyCommandLocalizations } from '../i18n/commandDescriptions.mts';
import * as achievements from './achievements.mts';
import { hug, kiss, pat, slap } from './actions.mts';
import * as afk from './afk.mts';
import * as ai from './ai.mts';
import * as aiserver from './aiserver.mts';
import * as antinuke from './antinuke.mts';
import * as applypanel from './applypanel.mts';
import * as ask from './ask.mts';
import * as avatar from './avatar.mts';
import * as backlog from './backlog.mts';
import * as backup from './backup.mts';
import * as birthday from './birthday.mts';
import * as blueprint from './blueprint.mts';
import * as buttonpanel from './buttonpanel.mts';
import * as cards from './cards.mts';
import * as caseCmd from './case.mts';
import * as cat from './cat.mts';
import * as confess from './confess.mts';
import * as dadjoke from './dadjoke.mts';
import * as describe from './describe.mts';
import * as dog from './dog.mts';
import * as donate from './donate.mts';
import * as economy from './economy.mts';
import * as event from './event.mts';
import * as farewell from './farewell.mts';
import * as flip from './flip.mts';
import * as fun from './fun.mts';
import * as giveaway from './giveaway.mts';
import * as healthcheck from './healthcheck.mts';
import * as heat from './heat.mts';
import * as help from './help.mts';
import * as highlight from './highlight.mts';
import * as hof from './hof.mts';
import * as imageonly from './imageonly.mts';
import * as imagine from './imagine.mts';
import * as invites from './invites.mts';
import * as library from './library.mts';
import * as link from './link.mts';
import * as linktwitch from './linktwitch.mts';
import * as liverole from './liverole.mts';
import * as lock from './lock.mts';
import * as lockdown from './lockdown.mts';
import * as lottery from './lottery.mts';
import * as market from './market.mts';
import * as marry from './marry.mts';
import * as math from './math.mts';
import * as meme from './meme.mts';
import * as mod from './mod.mts';
import * as modai from './modai.mts';
import * as panic from './panic.mts';
import * as persona from './persona.mts';
import * as pet from './pet.mts';
import * as ping from './ping.mts';
import * as poll from './poll.mts';
import * as portal from './portal.mts';
import * as prestige from './prestige.mts';
import * as pricealert from './pricealert.mts';
import * as profile from './profile.mts';
import * as quests from './quests.mts';
import * as raidmode from './raidmode.mts';
import * as rank from './rank.mts';
import * as reactionpanel from './reactionpanel.mts';
import * as remind from './remind.mts';
import * as rep from './rep.mts';
import * as rewrite from './rewrite.mts';
import * as rolecopy from './rolecopy.mts';
import * as rolemenu from './rolemenu.mts';
import * as roleperms from './roleperms.mts';
import * as rps from './rps.mts';
import * as schedule from './schedule.mts';
import * as search from './search.mts';
import * as serverinfo from './serverinfo.mts';
import * as ship from './ship.mts';
import * as skins from './skins.mts';
import * as slowmode from './slowmode.mts';
import * as sticky from './sticky.mts';
import * as stocks from './stocks.mts';
import * as streamsync from './streamsync.mts';
import * as suggest from './suggest.mts';
import * as ticket from './ticket.mts';
import * as ticketpanel from './ticketpanel.mts';
import * as tldr from './tldr.mts';
import * as translate from './translate.mts';
import * as trivia from './trivia.mts';
import * as ttt from './ttt.mts';
import * as tutorial from './tutorial.mts';
import * as undo from './undo.mts';
import * as unlock from './unlock.mts';
import * as userinfo from './userinfo.mts';
import * as vanityrole from './vanityrole.mts';
import * as verifypanel from './verifypanel.mts';
import * as wishlist from './wishlist.mts';
import * as xp from './xp.mts';
import * as xpevent from './xpevent.mts';

export type Command = {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  // Opcjonalny handler autouzupełniania (np. wyszukiwarka komend w /help).
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
};

export const commands: Command[] = [
  ping,
  library,
  antinuke,
  applypanel,
  link,
  portal,
  ticket,
  ai,
  mod,
  modai,
  caseCmd,
  describe,
  donate,
  remind,
  rolemenu,
  reactionpanel,
  schedule,
  skins,
  giveaway,
  buttonpanel,
  wishlist,
  pricealert,
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
  rps,
  flip,
  dadjoke,
  cat,
  dog,
  invites,
  linktwitch,
  lottery,
  market,
  xp,
  ask,
  rewrite,
  trivia,
  rep,
  confess,
  xpevent,
  event,
  help,
  tutorial,
  lockdown,
  sticky,
  farewell,
  search,
  persona,
  avatar,
  userinfo,
  serverinfo,
  slowmode,
  lock,
  unlock,
  healthcheck,
  roleperms,
  rolecopy,
  blueprint,
  aiserver,
  undo,
  achievements,
  ship,
  hug,
  kiss,
  slap,
  pat,
  marry,
  ttt,
  math,
  raidmode,
  backup,
  heat,
  panic,
  imageonly,
  streamsync,
  liverole,
  vanityrole,
  stocks,
  pet,
  cards,
  meme,
];

// i18n: wpina opisy komend w 14 językach (Discord-localizations) — centralnie, bez edycji
// pojedynczych plików komend. Mutuje buildery przed toJSON() (bot loader + deploy-commands).
applyCommandLocalizations(commands);
