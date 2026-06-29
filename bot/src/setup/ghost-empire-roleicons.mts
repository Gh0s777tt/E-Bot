// Ghost Empire — role-ikony (Boost 3). Staff = obrazki z customowych emoji serwera;
// VIP/specjalne = unicode. Idempotentne (nadpisuje ikonę).
//   node src/setup/ghost-empire-roleicons.mts --guild <ID> [--dry-run]

import { Client, Events, GatewayIntentBits, type Guild } from 'discord.js';
import { loadEnv } from '../env.mts';
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

// [roleId, emojiId, opisRoli] — ikona z obrazka customowego emoji
const IMG: [string, string, string][] = [
  ['1508144743593414801', '1508570542666678494', 'GHOST'],
  ['1508143403756552396', '1508570542666678494', 'ADMINISTRACJA'],
  ['1508144856592023572', '1508570571615637594', 'HEAD ADMIN'],
  ['1508144899780776096', '1508570542666678494', 'ADMIN'],
  ['1508144939404366097', '1508570580272812133', 'MOD'],
  ['1508144978965303486', '1508570758098583724', 'SUPPORT'],
  ['1508615260117139536', '1508570537822261448', 'ZWERYFIKOWANY'],
  ['1508145659058983052', '1508570514174509056', 'OG VIEWER'],
  ['1508145805247119420', '1508570754671841413', 'WINNER'],
];
// [roleId, unicodeEmoji, opis] — ikona unicode
const UNI: [string, string, string][] = [
  ['1508145708492918904', '⭐', 'VIP'],
  ['1508145754177536231', '🤝', 'PARTNER'],
  ['1508204727983280248', '💎', 'DUAL SUPPORTER'],
];

async function emojiBuf(id: string): Promise<Buffer> {
  const r = await fetch(`https://cdn.discordapp.com/emojis/${id}.png?size=96`);
  if (!r.ok) throw new Error(`emoji ${id} HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.roles.fetch();
    const hasFeature = guild.features.includes('ROLE_ICONS');
    log.info(`[gri] ROLE_ICONS: ${hasFeature ? 'TAK' : 'NIE'} (boost tier ${guild.premiumTier})`);

    if (DRY) {
      console.log('Obrazki:', IMG.map((x) => x[2]).join(', '));
      console.log('Unicode:', UNI.map((x) => `${x[2]}=${x[1]}`).join(', '));
      await c.destroy();
      process.exit(0);
    }
    if (!hasFeature) {
      log.error('[gri] Brak ROLE_ICONS (wymaga Boost 2+). Przerywam.');
      await c.destroy();
      process.exit(1);
    }

    let img = 0;
    let uni = 0;
    for (const [roleId, emojiId, name] of IMG) {
      const role = guild.roles.cache.get(roleId);
      if (!role) {
        log.warn(`[gri] brak roli ${name}`);
        continue;
      }
      try {
        const buf = await emojiBuf(emojiId);
        await role.setIcon(buf, 'Ghost Empire: role-ikona');
        img++;
      } catch (e) {
        log.warn(`[gri] ikona ${name}`, { err: (e as Error).message });
      }
    }
    for (const [roleId, emoji, name] of UNI) {
      const role = guild.roles.cache.get(roleId);
      if (!role) {
        log.warn(`[gri] brak roli ${name}`);
        continue;
      }
      try {
        await role.setUnicodeEmoji(emoji, 'Ghost Empire: role-ikona');
        uni++;
      } catch (e) {
        log.warn(`[gri] unicode ${name}`, { err: (e as Error).message });
      }
    }

    log.info('[gri] GOTOWE.', { obrazki: img, unicode: uni });
    console.log(`\n✅ Ghost Empire: role-ikony — obrazki: ${img}, unicode: ${uni}.\n`);
  } catch (e) {
    log.error('[gri] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
