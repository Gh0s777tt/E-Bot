// ════════════════════════════════════════════════════════════════════════════
//  Ghost Empire — partia 2: menu ról w #auto-role
// ════════════════════════════════════════════════════════════════════════════
//  • Gry (22) → dropdown (rolemenu) — wybór roli odblokowuje kategorię gry (perms już są).
//  • Zodiak (12), Powiadomienia (6), Płeć/Wiek (4) → panele reakcji (reaction_roles).
//  Idempotentne: panele dopasowuje po tytule embeda, dropdown po select 'rolemenu'.
//    node src/setup/ghost-empire-roles.mts --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import {
  ChannelType,
  Client,
  ComponentType,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  OverwriteType,
  PermissionFlagsBits as P,
  type TextChannel,
} from 'discord.js';
import { buildRoleMenu } from '../engagement/rolemenu.mts';
import { loadEnv } from '../env.mts';
import { cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { guildKey, setGuildSetting, setSetting } from '../lib/db.mts';
import { log } from '../lib/log.mts';

loadEnv();
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const guildArg = argv[argv.indexOf('--guild') + 1];
const token = process.env.DISCORD_BOT_TOKEN;
if (!token || !guildArg) {
  log.error('Użycie: --guild <ID>');
  process.exit(1);
}

const MARK = 'Ghost Empire • auto-role';
const BRAND = 0x8b1a1a;
const AUTO_ROLE_CH = '1508138689501597716';

// Gry → [label, roleId] (dropdown)
const GAMES: [string, string][] = [
  ['CS2', '1508147352064622705'],
  ['GTA RP', '1508147381881933944'],
  ['Valorant', '1508147410055073945'],
  ['League of Legends', '1508147438404243536'],
  ['Fortnite', '1508147464002207854'],
  ['Warzone', '1508147490417934596'],
  ['ReadSec', '1508147515961249894'],
  ['Warframe', '1508147542888681666'],
  ['Cyberpunk 2077', '1508147568335654992'],
  ['Minecraft', '1508148110302642257'],
  ['Hytale', '1508148154686767256'],
  ['Deadlock', '1508148181681180722'],
  ['Payday 3', '1508148258017509539'],
  ['Subnautica', '1508148397079789738'],
  ['Dota 2', '1508148490994188348'],
  ['Diablo', '1508148512812957859'],
  ['Path of Exile', '1508149086925361445'],
  ['ARC Riders', '1508149176091807916'],
  ['Rust', '1508149228998889665'],
  ['Ready or Not', '1508150282742403275'],
  ['World of Tanks', '1508150487419981914'],
  ['PUBG', '1508150546429907147'],
];

// Panele reakcji → [emoji, roleId, etykieta]
type Pair = [string, string, string];
const ZODIAK: Pair[] = [
  ['♈', '1508573375205871657', 'Baran'],
  ['♉', '1508573458563596559', 'Byk'],
  ['♊', '1508573552411017277', 'Bliźnięta'],
  ['♋', '1508573598418469056', 'Rak'],
  ['♌', '1508573647630106754', 'Lew'],
  ['♍', '1508573723819638986', 'Panna'],
  ['♎', '1508573759135682600', 'Waga'],
  ['♏', '1508612219976421537', 'Skorpion'],
  ['♐', '1508612341070168204', 'Strzelec'],
  ['♑', '1508612448553537646', 'Koziorożec'],
  ['♒', '1508612483806662797', 'Wodnik'],
  ['♓', '1508612550785503352', 'Ryby'],
];
const NOTIF: Pair[] = [
  ['🔔', '1508146857379893520', 'Live Notifs'],
  ['🎁', '1508147009159430205', 'Giveaway'],
  ['🏆', '1508147044500377651', 'Eventy'],
  ['📅', '1508147069825847459', 'Premiery'],
  ['📰', '1508147097667637248', 'News'],
  ['🔇', '1508147129254940892', 'No Pings'],
];
const PLEC_WIEK: Pair[] = [
  ['👦', '1508612781052661810', 'Chłopak'],
  ['👧', '1508612878415040522', 'Dziewczyna'],
  ['🔞', '1508613011953291375', '+18'],
  ['🧒', '1508613046418018315', '-18'],
];

function panelEmbed(title: string, pairs: Pair[], intro: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BRAND)
    .setTitle(title)
    .setDescription(`${intro}\n\n${pairs.map(([e, , label]) => `${e} — ${label}`).join('\n')}`)
    .setFooter({ text: MARK });
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild = await (await c.guilds.fetch(guildArg)).fetch();
    const ch = guild.channels.cache.get(AUTO_ROLE_CH) ?? (await guild.channels.fetch(AUTO_ROLE_CH));
    if (!ch || ch.type !== ChannelType.GuildText) {
      log.error('[ger] Kanał #auto-role nie znaleziony.');
      await c.destroy();
      process.exit(1);
    }
    const channel = ch as TextChannel;

    if (DRY) {
      console.log(`Dropdown Gry: ${GAMES.length} ról`);
      console.log(
        `Panel Zodiak: ${ZODIAK.length}, Powiadomienia: ${NOTIF.length}, Płeć/Wiek: ${PLEC_WIEK.length}`,
      );
      await c.destroy();
      process.exit(0);
    }

    // Kanał auto-role: tylko-do-odczytu (zostają same menu)
    await channel.permissionOverwrites
      .edit(guild.roles.everyone.id, { SendMessages: false }, { reason: 'auto-role read-only' })
      .catch(() => {});

    // ── 1) Gry → dropdown (rolemenu_config + select) ──
    const rmConfig = {
      message: '🎮 **Gry** — zaznacz, w co grasz. Dostaniesz rolę i **odblokujesz kanały gry**.',
      placeholder: 'Wybierz gry / Pick games…',
      options: GAMES.map(([label, roleId]) => ({ label, roleId, emoji: '🎮' })),
    };
    const rmJson = JSON.stringify(rmConfig);
    setGuildSetting(guild.id, 'rolemenu_config', rmJson);
    if (hasCloud())
      await cloudSetSetting(guildKey(guild.id, 'rolemenu_config'), rmJson).catch(() => {});

    const recent = await channel.messages.fetch({ limit: 40 }).catch(() => null);
    const mine = (title: string) =>
      recent?.find((m) => m.author.id === c.user.id && m.embeds.some((e) => e.title === title)) ??
      null;

    const row = buildRoleMenu(guild.id);
    const gamesTitle = '🎮 Gry / Games';
    const gamesMsg = recent?.find(
      (m) =>
        m.author.id === c.user.id &&
        m.components.some(
          (r) =>
            r.type === ComponentType.ActionRow &&
            r.components.some(
              (x) => x.type === ComponentType.StringSelect && x.customId === 'rolemenu',
            ),
        ),
    );
    const gamesEmbed = new EmbedBuilder()
      .setColor(BRAND)
      .setTitle(gamesTitle)
      .setDescription(rmConfig.message)
      .setFooter({ text: MARK });
    if (gamesMsg) await gamesMsg.edit({ embeds: [gamesEmbed], components: row ? [row] : [] });
    else await channel.send({ embeds: [gamesEmbed], components: row ? [row] : [] });

    // ── 2) Panele reakcji (zodiak / powiadomienia / płeć-wiek) ──
    const panels: { title: string; intro: string; pairs: Pair[] }[] = [
      { title: '♈ Znaki zodiaku', intro: 'Kliknij reakcję, by dostać swój znak:', pairs: ZODIAK },
      { title: '🔔 Powiadomienia', intro: 'Wybierz, o czym chcesz wiedzieć:', pairs: NOTIF },
      { title: '👤 Płeć i wiek', intro: 'Zaznacz swoje role:', pairs: PLEC_WIEK },
    ];
    const reactionRoles: { messageId: string; emoji: string; roleId: string }[] = [];
    for (const p of panels) {
      let msg = mine(p.title);
      if (!msg) msg = await channel.send({ embeds: [panelEmbed(p.title, p.pairs, p.intro)] });
      for (const [emoji] of p.pairs) await msg.react(emoji).catch(() => {});
      for (const [emoji, roleId] of p.pairs)
        reactionRoles.push({ messageId: msg.id, emoji, roleId });
    }

    // reaction_roles jest GLOBALNE (getSettings) → goły klucz
    const rrJson = JSON.stringify(reactionRoles);
    setSetting('reaction_roles', rrJson);
    if (hasCloud()) await cloudSetSetting('reaction_roles', rrJson).catch(() => {});

    log.info('[ger] GOTOWE.', {
      gry: GAMES.length,
      reaction_roles: reactionRoles.length,
      panele: panels.length,
    });
    console.log(
      `\n✅ Ghost Empire (partia 2): dropdown Gry (${GAMES.length}) + ${panels.length} panele reakcji (${reactionRoles.length} ról) w #auto-role.\n`,
    );
  } catch (e) {
    log.error('[ger] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
