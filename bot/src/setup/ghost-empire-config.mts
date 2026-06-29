// ════════════════════════════════════════════════════════════════════════════
//  Ghost Empire — partia 1: configi + porządki (zachowuje motyw serwera)
// ════════════════════════════════════════════════════════════════════════════
//  • Nagrody za poziomy: role Ghostling→Gh0st God → poziomy (level-up → #czat-główny)
//  • Anti-nuke ON (log → #logi-serwera, whitelista staffu)
//  • Powiadomienia o streamach → #live-now (+ ping 🔔 Live Notifs)
//  • Wpięcie: powitania → #witaj, logi → #logi-serwera, liczniki → 2 kanały
//  • Porządki: kategoria ADMINISTRACJA zamknięta + przeniesienie logów/mod-only do niej,
//    usunięcie sierot-duplikatów (powitania/ogłoszenia/pomoc-tickety) + duplikatów liczników
//  Scala z obecnymi configami (nie nadpisuje na ślepo). Idempotentne.
//    node src/setup/ghost-empire-config.mts --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  type Guild,
  OverwriteType,
  PermissionFlagsBits as P,
} from 'discord.js';
import { loadEnv } from '../env.mts';
import { cloudGetAllSettings, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
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

// ── ID z discovery ──────────────────────────────────────────────────────────
const R = {
  ghost: '1508144743593414801',
  administracja: '1508143403756552396',
  headAdmin: '1508144856592023572',
  admin: '1508144899780776096',
  mod: '1508144939404366097',
  liveNotif: '1508146857379893520',
  // poziomy (od najniższego)
  lvl: [
    ['1508146055777357913', 1], // 🥚 Ghostling
    ['1508146107379875920', 5], // 👤 Shadow
    ['1508146171808452670', 10], // 🌫️ Specter
    ['1508146218985984041', 20], // 👻 Haunt
    ['1508146262866919588', 35], // 🔥 Wraith
    ['1508146319145959444', 55], // 💀 Phantom Lord
    ['1508146362712326144', 80], // 👁️ Gh0st God
  ] as [string, number][],
};
const CH = {
  witaj: '1508138516033306856',
  liveNow: '1508140908959498321',
  czatGlowny: '1508139314133991525',
  logiSerwera: '1513876844372299977', // sierota — przeniosę do ADMINISTRACJI
  moderatorOnly: '1507036286941401254', // sierota (Community updates) — do ADMINISTRACJI
  adminCat: '1508177081543168040', // pusta kategoria ADMINISTRACJA
  counterMembers: '1513876845341184023',
  counterBoosts: '1513876846909849731',
  // do usunięcia (sieroty-duplikaty + duplikaty liczników)
  del: [
    '1513876841612447774', // powitania (dup → #witaj)
    '1513876842812145744', // ogłoszenia (dup → #│📢・ogłoszenia)
    '1513922416483766444', // pomoc-tickety (dup → #tt-pomoc)
    '1513921846440100152', // 👥 Członków (duplikat licznika)
    '1513921847551332353', // 🚀 Boostów (duplikat licznika)
  ],
};

function merge(raw: string | undefined, patch: Record<string, unknown>): string {
  let cur: Record<string, unknown> = {};
  try {
    if (raw) cur = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    /* puste */
  }
  return JSON.stringify({ ...cur, ...patch });
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.channels.fetch();
    const all: Record<string, string> = hasCloud()
      ? await cloudGetAllSettings().catch(() => ({}) as Record<string, string>)
      : {};
    const gk = (k: string) => all[`g:${guild.id}:${k}`] ?? all[k];

    // ── Patche configów ──
    const patches: Record<string, string> = {
      leveling_config: merge(gk('leveling_config'), {
        enabled: true,
        announceChannelId: CH.czatGlowny,
        stackRewards: false,
        levelUpMessage: '🏆 {user} awansował(a) na **poziom {level}**!',
        rewards: R.lvl.map(([roleId, level]) => ({ level, roleId })),
      }),
      antinuke: merge(gk('antinuke'), {
        enabled: true,
        logChannelId: CH.logiSerwera,
        punishment: 'ban',
        whitelistRoles: [R.ghost, R.administracja, R.headAdmin, R.admin],
        whitelistUsers: [guild.ownerId],
      }),
      welcome_config: merge(gk('welcome_config'), { enabled: true, channelId: CH.witaj }),
      logging_config: merge(gk('logging_config'), { enabled: true, channelId: CH.logiSerwera }),
      counters_config: merge(gk('counters_config'), {
        enabled: true,
        items: [
          { channelId: CH.counterMembers, type: 'members', template: '👥 Członków: {count}' },
          { channelId: CH.counterBoosts, type: 'boosts', template: '🚀 Boostów: {count}' },
        ],
      }),
    };
    const globals: Record<string, string> = {
      notify_channel_id: CH.liveNow,
      notify_enabled_twitch: '1',
      notify_enabled_kick: '1',
      notify_mention: `<@&${R.liveNotif}>`,
    };

    if (DRY) {
      log.info('[gec] PODGLĄD (--dry-run).');
      console.log('Configi per-serwer:', Object.keys(patches).join(', '));
      console.log('Globalne (live):', JSON.stringify(globals));
      console.log('Nagrody poziomów:', R.lvl.map(([, l]) => l).join(', '));
      console.log('Przeniosę do ADMINISTRACJI:', CH.logiSerwera, CH.moderatorOnly);
      console.log('Usunę:', CH.del.join(', '));
      await c.destroy();
      process.exit(0);
    }

    let cfg = 0;
    for (const [k, v] of Object.entries(patches)) {
      setGuildSetting(guild.id, k, v);
      if (hasCloud()) await cloudSetSetting(guildKey(guild.id, k), v).catch(() => {});
      cfg++;
    }
    for (const [k, v] of Object.entries(globals)) {
      setSetting(k, v); // notify_* czytane globalnie (getSettings) → goły klucz
      if (hasCloud()) await cloudSetSetting(k, v).catch(() => {});
    }
    log.info(`[gec] Zapisano ${cfg} configów + live (global).`);

    // ── Porządki: ADMINISTRACJA zamknięta + przeniesienie logów/mod-only ──
    const adminCat = guild.channels.cache.get(CH.adminCat);
    if (adminCat && 'permissionOverwrites' in adminCat) {
      await adminCat.permissionOverwrites
        .set(
          [
            { id: guild.roles.everyone.id, type: OverwriteType.Role, deny: [P.ViewChannel] },
            { id: R.ghost, type: OverwriteType.Role, allow: [P.ViewChannel] },
            { id: R.administracja, type: OverwriteType.Role, allow: [P.ViewChannel] },
            { id: R.headAdmin, type: OverwriteType.Role, allow: [P.ViewChannel] },
            { id: R.admin, type: OverwriteType.Role, allow: [P.ViewChannel] },
            { id: R.mod, type: OverwriteType.Role, allow: [P.ViewChannel] },
          ],
          'Ghost Empire: zamknięcie ADMINISTRACJI',
        )
        .catch((e) => log.warn('[gec] admin perms', { err: (e as Error).message }));
    }
    for (const id of [CH.logiSerwera, CH.moderatorOnly]) {
      const ch = guild.channels.cache.get(id);
      if (ch && 'setParent' in ch && adminCat)
        await ch
          .setParent(adminCat.id, { lockPermissions: true, reason: 'Ghost Empire: porządki' })
          .catch((e) => log.warn(`[gec] move ${id}`, { err: (e as Error).message }));
    }

    // ── Usuń sieroty-duplikaty ──
    let del = 0;
    for (const id of CH.del) {
      const ch = guild.channels.cache.get(id);
      if (!ch) continue;
      if (id === guild.rulesChannelId || id === guild.publicUpdatesChannelId) {
        log.warn(`[gec] „${ch.name}" wymagany przez Community — pomijam.`);
        continue;
      }
      await ch
        .delete('Ghost Empire: usunięcie sieroty-duplikatu')
        .then(() => del++)
        .catch((e) => log.warn(`[gec] del ${ch.name}`, { err: (e as Error).message }));
    }

    log.info('[gec] GOTOWE.', { configi: cfg, usunięto: del });
    console.log(
      `\n✅ Ghost Empire (partia 1): configi=${cfg}, usunięto=${del}, ADMINISTRACJA zamknięta.\n`,
    );
  } catch (e) {
    log.error('[gec] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
