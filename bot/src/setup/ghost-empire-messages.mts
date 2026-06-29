// ════════════════════════════════════════════════════════════════════════════
//  Ghost Empire — partia 1: ZNACZNIE lepsze wiadomości + panel linków
// ════════════════════════════════════════════════════════════════════════════
//  Bogate embedy (ikona serwera, sekcje, customowe emoji) + przyciski-linki do
//  platform/sklepu + karta powitalna. Edytuje istniejące wiadomości w miejscu.
//    node src/setup/ghost-empire-messages.mts --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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
const FOOT = 'Ghost Empire';
const E = {
  fire: '<:8103fireicon:1508570506746532042>',
  money: '<a:374900money:1508570751043895336>',
  live: '<a:6911twitchlive:1508570508503941201>',
  lvl: '<:27949redtanleveling:1508570582248194198>',
  member: '<:7549member:1508570514174509056>',
  lock: '<:6442neonredpadlock:1508570481387634870>',
  gift: '<:7375gift:1508570512530472961>',
  trophy: '<:51124trophyids:1508570754671841413>',
  check: '<:9690neonredcheckmark:1508570537822261448>',
};
const CH = {
  witaj: '1508138516033306856',
  regulamin: '1507036286941401251',
  ogloszenia: '1508138609625272460',
  faq: '1508138817331396659',
  mapa: '1508138984273088532',
  autorole: '1508138689501597716',
  czat: '1508139314133991525',
  live: '1508140908959498321',
  ttPomoc: '1508906936316465312',
};
const LINKS: {
  label: string;
  url: string;
  emoji?: { id: string; name: string; animated?: boolean };
}[] = [
  {
    label: 'Twitch',
    url: 'https://twitch.tv/gh0s77tt',
    emoji: { id: '1508570421606355186', name: '2041twitchlogoanimated', animated: true },
  },
  {
    label: 'Kick',
    url: 'https://kick.com/gh0s77tt',
    emoji: { id: '1508570782547316786', name: '721586neonkicklogo' },
  },
  {
    label: 'YouTube',
    url: 'https://youtube.com/@Gh0s77tt',
    emoji: { id: '1508570761173008425', name: '300997neonyoutubeplaybutton' },
  },
  { label: 'Rumble', url: 'https://rumble.com/user/gh7750stt' },
  {
    label: 'Platforma / Sklep',
    url: 'https://ghost-empire-web.vercel.app',
    emoji: { id: '1508570751043895336', name: '374900money', animated: true },
  },
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.channels.fetch();
    const icon = guild.iconURL({ size: 256 }) ?? undefined;
    const mc = guild.memberCount;

    const linkRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...LINKS.map((l) => {
        const b = new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(l.url).setLabel(l.label);
        if (l.emoji) {
          try {
            b.setEmoji(l.emoji);
          } catch {
            /* skip */
          }
        }
        return b;
      }),
    );

    const witaj = new EmbedBuilder()
      .setColor(BRAND)
      .setAuthor({ name: guild.name, iconURL: icon })
      .setTitle('👻 Witaj w Ghost Empire')
      .setDescription(
        `To oficjalna twierdza społeczności **Gh0s77tt** ${E.fire}\nJesteś jednym z **${mc}** duchów ${E.member}`,
      )
      .addFields(
        {
          name: `${E.lock} Jak zacząć`,
          value: `**1.** Zweryfikuj się w <#${CH.regulamin}>\n**2.** Odbierz role w <#${CH.autorole}>\n**3.** Wbij na <#${CH.czat}>`,
        },
        {
          name: `${E.money} Ekonomia & ${E.lvl} Poziomy`,
          value: `Zarabiaj **GT** za aktywność, awansuj **Ghostling → 👁️ Gh0st God**.\nKomendy: \`/balance\` · \`/daily\` · \`/rank\` · \`/shop\``,
        },
        {
          name: `${E.live} Streamy`,
          value: `Powiadomienia o livie w <#${CH.live}> — włącz rolę **🔔 Live Notifs** w <#${CH.autorole}>.`,
        },
      )
      .setThumbnail(icon ?? null)
      .setFooter({ text: FOOT });

    const regulamin = new EmbedBuilder()
      .setColor(BRAND)
      .setTitle('📜 Regulamin Ghost Empire')
      .setDescription(
        [
          `${E.lock} **Wchodząc na serwer, akceptujesz zasady:**`,
          '',
          '**1.** 🤝 Szacunek — zero hejtu, rasizmu, dyskryminacji i toksyczności.',
          '**2.** 🚫 Bez spamu, floodu, nadmiernego pingowania i reklam bez zgody.',
          '**3.** 🔞 Zakaz treści NSFW, nielegalnych i szkodliwych.',
          '**4.** 🎯 Trzymaj tematykę kanałów — o grze gadaj w jej kategorii.',
          '**5.** 🎭 Bez podszywania się, scamów i obchodzenia kar.',
          '**6.** 🛡️ Słuchaj administracji i moderacji.',
          '**7.** 📋 Obowiązuje [Regulamin Discord](https://discord.com/terms) i wiek **13+**.',
          '',
          `${E.check} **Dostęp do serwera dostaniesz po weryfikacji poniżej.** ⬇️`,
        ].join('\n'),
      )
      .setThumbnail(icon ?? null)
      .setFooter({ text: FOOT });

    const faq = new EmbedBuilder()
      .setColor(BRAND)
      .setTitle('❓ FAQ — najczęstsze pytania')
      .addFields(
        {
          name: `${E.lock} Jak dostać dostęp?`,
          value: `Zweryfikuj się w <#${CH.regulamin}> — jeden klik.`,
        },
        {
          name: '🎭 Jak odebrać role?',
          value: `Rozwijane menu w <#${CH.autorole}> (gry odblokowują kanały!).`,
        },
        {
          name: `${E.lvl} Jak działają poziomy?`,
          value: 'XP za czat/voice → rangi + nagrody GT. `/rank`.',
        },
        {
          name: `${E.money} Czym jest GT?`,
          value:
            'Waluta serwera (Ghost Tokeny), połączona z platformą. `/balance` `/daily` `/shop`.',
        },
        { name: '🎫 Mam problem / współpraca?', value: `Otwórz ticket w <#${CH.ttPomoc}>.` },
      )
      .setFooter({ text: FOOT });

    const mapa = new EmbedBuilder()
      .setColor(BRAND)
      .setTitle('🗺️ Mapa serwera')
      .setDescription(
        [
          '**📜 Informacje** — regulamin, ogłoszenia, auto-role, FAQ.',
          '**👻 Społeczność** — czat, memy, media, muzyka, propozycje.',
          `**${E.live} Stream** — live-now, klipy, dropy, harmonogram, predykcje.`,
          '**👑 Sub Club** — strefa subów i VIP-ów.',
          `**${E.trophy} Eventy & Nagrody** — eventy, ${E.gift} giveawaye, konkursy, leaderboard.`,
          '**🎮 Gry** — osobne kategorie (odblokuj rolą gry).',
          '**🎫 Pomoc** — tickety i wsparcie.',
        ].join('\n'),
      )
      .setThumbnail(icon ?? null)
      .setFooter({ text: FOOT });

    const ogloszenia = new EmbedBuilder()
      .setColor(BRAND)
      .setAuthor({ name: guild.name, iconURL: icon })
      .setTitle('📢 Ghost Empire — otwarte!')
      .setDescription(
        `${E.fire} Serwer wystartował! Weryfikacja, role, poziomy, ekonomia ${E.money} GT, tickety, sub-club ${E.trophy} i powiadomienia o streamach ${E.live} — wszystko gotowe.\n\nWłącz **🔔 Live Notifs** w auto-role i zapraszaj znajomych! 👻`,
      )
      .setFooter({ text: FOOT });

    const TARGETS: {
      ch: string;
      key: string;
      embed: EmbedBuilder;
      comps?: ActionRowBuilder<ButtonBuilder>[];
    }[] = [
      { ch: CH.witaj, key: 'witaj', embed: witaj, comps: [linkRow] },
      { ch: CH.regulamin, key: 'regulamin', embed: regulamin },
      { ch: CH.faq, key: 'faq', embed: faq },
      { ch: CH.mapa, key: 'mapa', embed: mapa },
      { ch: CH.ogloszenia, key: 'otwart', embed: ogloszenia },
    ];

    // welcome_config: włącz kartę powitalną + bogata wiadomość
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
    const wcJson = JSON.stringify({
      ...wc,
      enabled: true,
      channelId: CH.witaj,
      cardEnabled: true,
      message: `👻 Witaj {user} w **Ghost Empire**! ${E.lock} Zweryfikuj się w <#${CH.regulamin}>, odbierz role w <#${CH.autorole}> i baw się dobrze! ${E.fire}`,
    });

    if (DRY) {
      console.log(
        'Zaktualizuję wiadomości w:',
        TARGETS.map((t) => t.key).join(', '),
        '+ panel linków + karta powitalna.',
      );
      await c.destroy();
      process.exit(0);
    }

    setGuildSetting(guild.id, 'welcome_config', wcJson);
    if (hasCloud())
      await cloudSetSetting(guildKey(guild.id, 'welcome_config'), wcJson).catch(() => {});

    let upd = 0;
    for (const t of TARGETS) {
      const ch = guild.channels.cache.get(t.ch);
      if (!ch?.isTextBased()) continue;
      const recent = await ch.messages.fetch({ limit: 25 }).catch(() => null);
      // edytuj wiadomość bota z embedem (stopka Ghost Empire) pasującą do tytułu (po słowie kluczu)
      const mine = recent?.find(
        (m) =>
          m.author.id === c.user.id &&
          m.embeds.some((em) => (em.title ?? '').toLowerCase().includes(t.key)),
      );
      const payload = { embeds: [t.embed], components: t.comps ?? [] };
      if (mine)
        await mine
          .edit(payload)
          .catch((e) => log.warn(`[gmsg] edit ${t.key}`, { err: (e as Error).message }));
      else
        await (ch as TextChannel)
          .send(payload)
          .catch((e) => log.warn(`[gmsg] send ${t.key}`, { err: (e as Error).message }));
      upd++;
    }

    log.info('[gmsg] GOTOWE.', { wiadomości: upd, karta: true });
    console.log(
      `\n✅ Ghost Empire (partia 1): odświeżono ${upd} wiadomości + panel linków + karta powitalna ON.\n`,
    );
  } catch (e) {
    log.error('[gmsg] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
