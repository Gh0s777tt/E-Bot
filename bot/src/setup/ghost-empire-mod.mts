// ════════════════════════════════════════════════════════════════════════════
//  Ghost Empire — partia A: automod + pełna moderacja + naprawa uprawnień SUB CLUB
// ════════════════════════════════════════════════════════════════════════════
//  • Tworzy #logi-moderacji w ADMINISTRACJI; automod (scam/spam/zaproszenia/caps +
//    eskalacja → timeout) i antiraid (alert) logują tam; logi serwera → #logi-serwera.
//  • SUB CLUB: dodaje +view WSZYSTKIM rangom sub/Kick/T2/T3 (część ich nie miała).
//  Scala z obecnymi configami. Idempotentne.
//    node src/setup/ghost-empire-mod.mts --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  type Guild,
  PermissionFlagsBits as P,
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

const ADMIN_CAT = '1508177081543168040';
const LOGI_SERWERA = '1513876844372299977';
const SUB_CLUB_CAT = '1508202730060251246';
const STAFF_EXEMPT = '1508144978965303486'; // ꜱᴜᴘᴘᴏʀᴛ (i tak staff z ManageMessages jest pomijany)

// Wszystkie rangi z dostępem do SUB CLUB
const SUB_ROLES = [
  '1508204509577478174',
  '1508204480930381824',
  '1508204450911752262',
  '1508204427620651079',
  '1508204403541278740', // T3
  '1508204357651533906',
  '1508204325258788985',
  '1508204255972954216',
  '1508204220086751363',
  '1508204188583202907', // T2
  '1508204113882644490',
  '1508204086015557802',
  '1508204056995172415',
  '1508204030231449731',
  '1508203800257888327', // Sub
  '1508204699369865446',
  '1508204673692078220',
  '1508204645896425552',
  '1508204623117291611',
  '1508204537767526460', // Kick
  '1508204727983280248', // DUAL SUPPORTER
  '1508145708492918904', // ⭐ VIP
];

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
    await guild.roles.fetch();
    const all: Record<string, string> = hasCloud()
      ? await cloudGetAllSettings().catch(() => ({}) as Record<string, string>)
      : {};
    const gk = (k: string) => all[`g:${guild.id}:${k}`] ?? all[k];

    // ── #logi-moderacji w ADMINISTRACJI ──
    let modlog = guild.channels.cache.find(
      (x) => x.type === ChannelType.GuildText && /logi-moderacji|mod-log/i.test(x.name),
    );
    if (!modlog && !DRY) {
      modlog = await guild.channels.create({
        name: '🔨・logi-moderacji',
        type: ChannelType.GuildText,
        parent: ADMIN_CAT,
        reason: 'Ghost Empire: log moderacji',
      });
      await modlog.lockPermissions().catch(() => {});
    }
    const modlogId = modlog?.id ?? LOGI_SERWERA;

    const patches: Record<string, string> = {
      automod_config: merge(gk('automod_config'), {
        enabled: true,
        blockInvites: true,
        blockLinks: false,
        maxMentions: 6,
        antiSpamCount: 6,
        antiSpamSec: 5,
        modlogChannelId: modlogId,
        exemptRoleId: STAFF_EXEMPT,
        antiScam: { enabled: true, customDomains: [] },
        pii: { enabled: false },
        action: 'delete',
        timeoutMinutes: 10,
        escalation: { enabled: true, threshold: 3, windowMin: 10, action: 'timeout' },
        antiCaps: { enabled: true, percent: 75, minLength: 12 },
        antiSpoiler: { enabled: true, maxSpoilers: 6 },
      }),
      antiraid_config: merge(gk('antiraid_config'), {
        enabled: true,
        joinCount: 8,
        windowSec: 10,
        action: 'kick',
        alertChannelId: modlogId,
        minAccountAgeDays: 0,
        altDetect: true,
        altMinAgeDays: 7,
        altNoAvatar: true,
        altAction: 'alert',
        autoLockdown: false,
      }),
      logging_config: merge(gk('logging_config'), {
        enabled: true,
        channelId: LOGI_SERWERA,
        messages: true,
        members: true,
        memberUpdates: true,
        moderation: true,
        server: true,
        voice: false,
      }),
    };

    if (DRY) {
      console.log('Configi:', Object.keys(patches).join(', '));
      console.log('modlog:', modlog ? modlog.name : '(utworzę)');
      console.log('SUB CLUB +view dla', SUB_ROLES.length, 'rang');
      await c.destroy();
      process.exit(0);
    }

    let cfg = 0;
    for (const [k, v] of Object.entries(patches)) {
      setGuildSetting(guild.id, k, v);
      if (hasCloud()) await cloudSetSetting(guildKey(guild.id, k), v).catch(() => {});
      cfg++;
    }

    // ── SUB CLUB: +view wszystkim rangom sub ──
    let fixed = 0;
    const subCat = guild.channels.cache.get(SUB_CLUB_CAT);
    if (subCat && 'permissionOverwrites' in subCat) {
      for (const rid of SUB_ROLES) {
        if (!guild.roles.cache.has(rid)) continue;
        await subCat.permissionOverwrites
          .edit(rid, { ViewChannel: true }, { reason: 'Ghost Empire: dostęp sub-club' })
          .then(() => fixed++)
          .catch((e) => log.warn(`[gem] sub ${rid}`, { err: (e as Error).message }));
      }
    }

    log.info('[gem] GOTOWE.', { configi: cfg, sub_view: fixed, modlog: modlog?.name });
    console.log(
      `\n✅ Ghost Empire (partia A): automod + antiraid + logi (${cfg}), #logi-moderacji, SUB CLUB +view dla ${fixed} rang.\n`,
    );
  } catch (e) {
    log.error('[gem] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
