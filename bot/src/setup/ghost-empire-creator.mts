// ════════════════════════════════════════════════════════════════════════════
//  Ghost Empire — partia 2: wire'owanie funkcji twórcy
// ════════════════════════════════════════════════════════════════════════════
//  • Klipy Twitch → #klipy-z-live (creator_config)
//  • Harmonogram Twitch → Wydarzenia Discord (schedule_sync, login z env TWITCH_CHANNEL)
//  • Darmowe gry (Epic + ITAD) → #darmowe-gry (freegames_config)
//  • Patch-notes Steam per gra → kanał #changelogs danej kategorii (patchnotes_config.items)
//  Scala z obecnymi configami. node ... --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import { ChannelType, Client, Events, GatewayIntentBits, type Guild } from 'discord.js';
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

const CH = {
  klipy: '1508140082576494692',
  darmoweGry: '1508841795352793108',
};
// Gry z Steam News → [kategoria, nazwa, appId]; #changelogs = pierwszy kanał tekstowy kategorii
const STEAM: [string, string, number][] = [
  ['1508525395669024820', 'CS2', 730],
  ['1508525790940233748', 'Dota 2', 570],
  ['1508525358025281557', 'PUBG', 578080],
  ['1508525917830385825', 'Rust', 252490],
  ['1508525581405261989', 'Warframe', 230410],
  ['1508525857294123029', 'Path of Exile', 238960],
  ['1508525614544588961', 'Cyberpunk 2077', 1091500],
  ['1508525772548079909', 'Subnautica', 264710],
  ['1508525740310794321', 'Payday 3', 1272080],
  ['1508525950793678948', 'Ready or Not', 1144200],
  ['1508525714276745236', 'Deadlock', 1422450],
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
    const all: Record<string, string> = hasCloud()
      ? await cloudGetAllSettings().catch(() => ({}) as Record<string, string>)
      : {};
    const gk = (k: string) => all[`g:${guild.id}:${k}`] ?? all[k];

    // #changelogs = pierwszy kanał tekstowy w kategorii gry
    const firstText = (catId: string): string | null => {
      const kids = [...guild.channels.cache.values()]
        .filter((x) => x.parentId === catId && x.type === ChannelType.GuildText)
        .sort((a, b) => ('position' in a && 'position' in b ? a.position - b.position : 0));
      return kids[0]?.id ?? null;
    };
    const items = STEAM.map(([cat, name, appId]) => {
      const ch = firstText(cat);
      return ch ? { name, source: { kind: 'steam' as const, appId }, channelId: ch } : null;
    }).filter(
      (x): x is { name: string; source: { kind: 'steam'; appId: number }; channelId: string } =>
        Boolean(x),
    );

    const patches: Record<string, string> = {
      creator_config: merge(gk('creator_config'), { clipRelay: true, clipChannelId: CH.klipy }),
      freegames_config: merge(gk('freegames_config'), {
        enabled: true,
        channelId: CH.darmoweGry,
        multiStore: !!process.env.ITAD_API_KEY,
      }),
      patchnotes_config: merge(gk('patchnotes_config'), {
        enabled: true,
        channelId: CH.darmoweGry,
        digest: 'instant',
        aiSummary: false,
        items,
      }),
    };
    const scheduleSync = JSON.stringify({
      enabled: true,
      login: (process.env.TWITCH_CHANNEL ?? 'gh0s77tt').trim(),
    });

    if (DRY) {
      console.log('creator_config: klipy →', CH.klipy);
      console.log('freegames_config: →', CH.darmoweGry, 'multiStore=', !!process.env.ITAD_API_KEY);
      console.log('patchnotes: items =', items.length, items.map((i) => i.name).join(', '));
      console.log('schedule_sync (global):', scheduleSync);
      await c.destroy();
      process.exit(0);
    }

    let cfg = 0;
    for (const [k, v] of Object.entries(patches)) {
      setGuildSetting(guild.id, k, v);
      if (hasCloud()) await cloudSetSetting(guildKey(guild.id, k), v).catch(() => {});
      cfg++;
    }
    setSetting('schedule_sync', scheduleSync); // globalne (getSettings)
    if (hasCloud()) await cloudSetSetting('schedule_sync', scheduleSync).catch(() => {});

    log.info('[gcr] GOTOWE.', { configi: cfg + 1, patchnotes_gier: items.length });
    console.log(
      `\n✅ Ghost Empire (partia 2): klipy + harmonogram + darmowe gry + patch-notes (${items.length} gier Steam → #changelogs).\n`,
    );
  } catch (e) {
    log.error('[gcr] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
