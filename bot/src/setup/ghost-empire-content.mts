// ════════════════════════════════════════════════════════════════════════════
//  Ghost Empire — partia B: customowe treści (regulamin, powitanie, ogłoszenia, FAQ, mapa)
// ════════════════════════════════════════════════════════════════════════════
//  Profesjonalne, motywowane embedy z customowymi emoji serwera + wiadomość powitalna.
//  Idempotentne (dopasowanie po tytule embeda). node ... --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  type Guild,
  type TextChannel,
} from 'discord.js';
import { loadEnv } from '../env.mts';
import { cloudGetAllSettings, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { guildKey, setGuildSetting } from '../lib/db.mts';
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

const BRAND = 0x8b1a1a;
const MARK = 'Ghost Empire';
// Customowe emoji serwera (z discovery)
const E = {
  lock: '<:6442neonredpadlock:1508570481387634870>',
  check: '<:9690neonredcheckmark:1508570537822261448>',
  money: '<a:374900money:1508570751043895336>',
  live: '<a:6911twitchlive:1508570508503941201>',
  gift: '<:7375gift:1508570512530472961>',
  trophy: '<:51124trophyids:1508570754671841413>',
  lvl: '<:27949redtanleveling:1508570582248194198>',
  member: '<:7549member:1508570514174509056>',
  fire: '<:8103fireicon:1508570506746532042>',
  twitch: '<a:2041twitchlogoanimated:1508570421606355186>',
  kick: '<:721586neonkicklogo:1508570782547316786>',
  yt: '<:300997neonyoutubeplaybutton:1508570761173008425>',
  mod: '<:25154redmod:1508570580272812133>',
  news: '<a:breakingnewsanimatedgif:1508570780890300476>',
  x: '<:7150neonredcross:1508570510047449269>',
};

const CH = {
  regulamin: '1507036286941401251',
  witaj: '1508138516033306856',
  ogloszenia: '1508138609625272460',
  faq: '1508138817331396659',
  mapa: '1508138984273088532',
};

function e(title: string, desc: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BRAND)
    .setTitle(title)
    .setDescription(desc)
    .setFooter({ text: MARK });
}

const CONTENT: { ch: string; title: string; desc: string }[] = [
  {
    ch: CH.regulamin,
    title: '📜 Regulamin Ghost Empire',
    desc: [
      `${E.lock} **Wchodząc na serwer, akceptujesz poniższe zasady:**`,
      '',
      `**1.** Szanuj innych — zero hejtu, rasizmu, dyskryminacji i toksyczności.`,
      `**2.** Bez spamu, floodu, nadmiernego pingowania i reklam bez zgody.`,
      `**3.** Zakaz treści NSFW, nielegalnych, szkodliwych i łamiących prawo.`,
      `**4.** Trzymaj tematykę kanałów — gadkę o grze prowadź w jej kategorii.`,
      `**5.** Bez podszywania się, oszustw, scamów i obchodzenia kar.`,
      `**6.** Stosuj się do poleceń ${E.mod} administracji i moderacji.`,
      `**7.** Obowiązuje [Regulamin Discord](https://discord.com/terms) oraz wiek **13+**.`,
      '',
      `${E.check} **Aby uzyskać dostęp do serwera — zweryfikuj się niżej.** ⬇️`,
    ].join('\n'),
  },
  {
    ch: CH.witaj,
    title: '👻 Witaj w Ghost Empire!',
    desc: [
      `Cześć i witaj w oficjalnej społeczności **Gh0s77tt**! ${E.fire}`,
      '',
      `${E.lock} **Krok 1:** zweryfikuj się w <#${CH.regulamin}>, żeby odblokować serwer.`,
      `🎭 **Krok 2:** odbierz role w **#auto-role** — gry (odblokowują kanały!), zodiak, powiadomienia.`,
      `${E.lvl} **Poziomy:** zdobywaj XP za aktywność i awansuj: Ghostling → 👁️ Gh0st God.`,
      `${E.money} **Ekonomia:** zarabiaj **GT** za czat i voice — połączone z platformą Ghost Empire.`,
      `${E.live} **Streamy:** powiadomienia o livie w **#live-now** (${E.twitch} Twitch · ${E.kick} Kick · ${E.yt} YouTube).`,
      `${E.gift} **Eventy i giveawaye** + ${E.trophy} rankingi czekają w swoich kategoriach.`,
      '',
      `Miłego pobytu w Imperium! 💀🖤`,
    ].join('\n'),
  },
  {
    ch: CH.ogloszenia,
    title: '📢 Serwer oficjalnie otwarty!',
    desc: [
      `${E.news} **Ghost Empire wystartowało!**`,
      '',
      `Wszystko gotowe: weryfikacja, role, poziomy, ekonomia ${E.money} GT, tickety, powiadomienia o streamach ${E.live} i sub-club ${E.trophy}.`,
      '',
      `Włącz rolę **🔔 Live Notifs** w **#auto-role**, żeby nie przegapić livestreamów!`,
      `Zapraszaj znajomych i baw się dobrze. 👻`,
    ].join('\n'),
  },
  {
    ch: CH.faq,
    title: '❓ Najczęstsze pytania (FAQ)',
    desc: [
      `**${E.lock} Jak dostać dostęp do serwera?**`,
      `Zweryfikuj się w <#${CH.regulamin}> — klik przycisk i gotowe.`,
      '',
      `**🎭 Jak dostać role gier / zodiak / powiadomienia?**`,
      `Wejdź na **#auto-role** i wybierz z menu. Rola gry odblokowuje jej kanały.`,
      '',
      `**${E.lvl} Jak działają poziomy?**`,
      `Piszesz i siedzisz na voice → zdobywasz XP → awansujesz na rangi i dostajesz nagrody ${E.money} GT.`,
      '',
      `**${E.money} Czym jest GT?**`,
      `Ghost Tokeny — waluta serwera za aktywność, połączona z platformą. Sprawdź **/balance**, **/daily**, **/shop**.`,
      '',
      `**🎫 Mam problem / chcę współpracy.**`,
      `Otwórz ticket w **#tt-pomoc** — obsługa się odezwie.`,
    ].join('\n'),
  },
  {
    ch: CH.mapa,
    title: '🗺️ Mapa serwera',
    desc: [
      `**📜 Informacje** — regulamin, ogłoszenia, auto-role, FAQ.`,
      `**👻 Społeczność** — czat główny, memy, media, muzyka, komendy.`,
      `**${E.live} Stream** — live-now, klipy, dropy, schedule, predykcje.`,
      `**👑 Sub Club** — strefa tylko dla subów i VIP-ów.`,
      `**${E.trophy} Eventy & Nagrody** — eventy, giveawaye, konkursy, leaderboard.`,
      `**🎮 Gry** — osobne kategorie (odblokowujesz rolą gry w #auto-role).`,
      `**🎫 Pomoc** — tickety i wsparcie.`,
    ].join('\n'),
  },
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.channels.fetch();

    // welcome_config: customowa wiadomość powitalna na wejście
    const all: Record<string, string> = hasCloud()
      ? await cloudGetAllSettings().catch(() => ({}) as Record<string, string>)
      : {};
    let wc: Record<string, unknown> = {};
    try {
      const raw = all[`g:${guild.id}:welcome_config`] ?? all.welcome_config;
      if (raw) wc = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      /* puste */
    }
    const welcomeMsg = `👻 Witaj {user} w **Ghost Empire**! ${E.lock} Zweryfikuj się w <#${CH.regulamin}>, odbierz role w **#auto-role** i baw się dobrze! 💀${E.fire}`;
    const wcJson = JSON.stringify({
      ...wc,
      enabled: true,
      channelId: CH.witaj,
      message: welcomeMsg,
    });

    if (DRY) {
      console.log('Treści do opublikowania:', CONTENT.map((x) => x.title).join(' · '));
      console.log('welcome_config.message ustawiony.');
      await c.destroy();
      process.exit(0);
    }

    setGuildSetting(guild.id, 'welcome_config', wcJson);
    if (hasCloud())
      await cloudSetSetting(guildKey(guild.id, 'welcome_config'), wcJson).catch(() => {});

    let posted = 0;
    for (const item of CONTENT) {
      const ch = guild.channels.cache.get(item.ch);
      if (!ch?.isTextBased()) continue;
      const recent = await ch.messages.fetch({ limit: 20 }).catch(() => null);
      const exists = recent?.some(
        (m) => m.author.id === c.user.id && m.embeds.some((em) => em.title === item.title),
      );
      if (exists) continue;
      await (ch as TextChannel)
        .send({ embeds: [e(item.title, item.desc)] })
        .catch((err) => log.warn(`[gct] post ${item.title}`, { err: (err as Error).message }));
      posted++;
    }

    log.info('[gct] GOTOWE.', { opublikowano: posted });
    console.log(
      `\n✅ Ghost Empire (partia B): opublikowano ${posted} treści + customowa wiadomość powitalna.\n`,
    );
  } catch (e2) {
    log.error('[gct] błąd', { err: (e2 as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
