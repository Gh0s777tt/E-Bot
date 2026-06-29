// Ghost Empire — partia 3: kanały staffu + pozycja ról-kolorów.
//   node src/setup/ghost-empire-polish.mts --guild <ID> [--dry-run]

import { ChannelType, Client, Events, GatewayIntentBits, type Guild } from 'discord.js';
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

const ADMIN_CAT = '1508177081543168040';
const POZIOMY_SEP = '1508143716433530971';
const COLOR_NAMES = [
  '🔴 Krwawa Czerwień',
  '🟣 Widmowy Fiolet',
  '🔵 Mroźny Błękit',
  '🟢 Toksyczna Zieleń',
  '🟡 Złoto Imperium',
  '🌸 Upiorny Róż',
];
const STAFF_CHANNELS = [
  { name: '🛡️・mod-chat', topic: 'Rozmowy zespołu (staff only).' },
  { name: '⚙️・komendy-staff', topic: 'Komendy bota dla administracji.' },
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.channels.fetch();
    await guild.roles.fetch();

    if (DRY) {
      console.log('Utworzę w ADMINISTRACJI:', STAFF_CHANNELS.map((s) => s.name).join(', '));
      console.log('Podniosę role-kolory nad POZIOMY:', COLOR_NAMES.length);
      await c.destroy();
      process.exit(0);
    }

    // Kanały staffu (idempotentnie — po nazwie)
    let made = 0;
    for (const s of STAFF_CHANNELS) {
      const exists = guild.channels.cache.find(
        (x) =>
          x.type === ChannelType.GuildText && x.name === s.name.toLowerCase().replace(/\s+/g, '-'),
      );
      if (exists) continue;
      const ch = await guild.channels
        .create({
          name: s.name,
          type: ChannelType.GuildText,
          parent: ADMIN_CAT,
          topic: s.topic,
          reason: 'Ghost Empire: staff',
        })
        .catch((e) => {
          log.warn(`[gpol] ${s.name}`, { err: (e as Error).message });
          return null;
        });
      if (ch) {
        await ch.lockPermissions().catch(() => {});
        made++;
      }
    }

    // Role-kolory nad separatorem POZIOMY (żeby kolor nicku był widoczny ponad rangami poziomów)
    const sep = guild.roles.cache.get(POZIOMY_SEP);
    const colors = COLOR_NAMES.map((n) => guild.roles.cache.find((r) => r.name === n)).filter(
      (r): r is NonNullable<typeof r> => Boolean(r),
    );
    let moved = 0;
    if (sep && colors.length) {
      try {
        await guild.roles.setPositions(colors.map((r) => ({ role: r.id, position: sep.position })));
        moved = colors.length;
      } catch (e) {
        log.warn('[gpol] pozycje kolorów — nieudane (przeciągnij ręcznie)', {
          err: (e as Error).message,
        });
      }
    }

    log.info('[gpol] GOTOWE.', { kanały_staff: made, kolory_przeniesione: moved });
    console.log(
      `\n✅ Ghost Empire (partia 3): kanały staffu +${made}, role-kolory podniesione: ${moved}.\n`,
    );
  } catch (e) {
    log.error('[gpol] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
