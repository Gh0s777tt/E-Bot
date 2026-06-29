// ════════════════════════════════════════════════════════════════════════════
//  E-Forge (hub) — feed wydań z GitHuba (releases.atom) → kanały …-info produktów
// ════════════════════════════════════════════════════════════════════════════
//  Wpina patchnotes_config (źródło RSS = GitHub releases.atom) dla repo-produktów.
//  Bot (już wdrożony) odpytuje co 1h; przy 1. zobaczeniu publikuje tylko NAJNOWSZE
//  wydanie, starsze zasiewa cicho (anty-spam). Wymaga konta z chmurą (Supabase).
//    node src/setup/eforge-feeds.mts --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import { Client, Events, GatewayIntentBits, type Guild } from 'discord.js';
import { loadEnv } from '../env.mts';
import { cloudGetAllSettings, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { guildKey, setGuildSetting } from '../lib/db.mts';
import { log } from '../lib/log.mts';

loadEnv();
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const guildArg = argv[argv.indexOf('--guild') + 1] ?? '1515985902566899762';
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  log.error('Brak DISCORD_BOT_TOKEN');
  process.exit(1);
}

const DEFAULT_CH = '1521070177540767846'; // #aktualizacje (fallback)
// [nazwa, repo (owner/name), kanał …-info produktu]
const REPOS: [string, string, string][] = [
  ['E-Bot', 'Gh0s777tt/E-Bot', '1521070244469407744'],
  ['E-OS', 'Gh0s777tt/e-os', '1521070284784795698'],
];

type RssSource = { kind: 'rss'; url: string };
type Item = { name: string; source: RssSource; channelId: string };
const items: Item[] = REPOS.map(([name, repo, channelId]) => ({
  name: `${name} · GitHub`,
  source: { kind: 'rss', url: `https://github.com/${repo}/releases.atom` },
  channelId,
}));

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
    const all: Record<string, string> = hasCloud()
      ? await cloudGetAllSettings().catch(() => ({}) as Record<string, string>)
      : {};
    const cur = all[`g:${guild.id}:patchnotes_config`] ?? all.patchnotes_config;

    const cfg = merge(cur, {
      enabled: true,
      channelId: DEFAULT_CH,
      digest: 'instant',
      aiSummary: false,
      items,
    });

    if (DRY) {
      console.log('patchnotes_config →', cfg);
      console.log(
        'Feedy:',
        items.map((i) => `${i.name} → ${i.channelId}`).join(' · '),
      );
      await c.destroy();
      process.exit(0);
    }

    setGuildSetting(guild.id, 'patchnotes_config', cfg);
    if (hasCloud()) await cloudSetSetting(guildKey(guild.id, 'patchnotes_config'), cfg).catch(() => {});

    log.info('[eff] GOTOWE.', { feedów: items.length });
    console.log(
      `\n✅ E-Forge hub: feed wydań GitHub (${items.length} repo → kanały …-info) wpięty w patchnotes_config.\n` +
        `   Bot odpytuje co 1h; nowe wydania (GitHub Releases) wylądują na #${REPOS.map((r) => r[0]).join(', #')}-info.\n` +
        `   ⚠️ Aktywuje się, gdy w repo jest opublikowane GitHub Release (releases.atom).\n`,
    );
  } catch (e) {
    log.error('[eff] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
