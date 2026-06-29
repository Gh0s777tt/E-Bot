// ════════════════════════════════════════════════════════════════════════════
//  E-Forge (hub) — webhook GitHub → #github (commity / PR-y / wydania)
// ════════════════════════════════════════════════════════════════════════════
//  Tworzy (idempotentnie) webhook Discorda w istniejącym kanale 🐙 github i
//  wypisuje URL. Wklejasz <URL>/github w Settings→Webhooks repo na GitHubie —
//  i koniec. Kanał jest dev-only (kategoria ⚙️ DEV / OPS).
//    node src/setup/eforge-github.mts --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  type Guild,
  type TextChannel,
} from 'discord.js';
import { loadEnv } from '../env.mts';
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

const HOOK_NAME = 'GitHub';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.channels.fetch();
    const ch = guild.channels.cache.find(
      (x): x is TextChannel => x.type === ChannelType.GuildText && x.name.includes('github'),
    );
    if (!ch) {
      log.error('[efg] Kanał #github nie znaleziony.');
      await c.destroy();
      process.exit(1);
    }

    if (DRY) {
      console.log('Kanał:', ch.name, ch.id);
      await c.destroy();
      process.exit(0);
    }

    // Idempotentnie: wykorzystaj istniejący webhook bota „GitHub", inaczej utwórz.
    const hooks = await ch.fetchWebhooks().catch(() => null);
    let hook = hooks?.find((w) => w.owner?.id === c.user.id && w.name === HOOK_NAME) ?? null;
    let created = false;
    if (!hook) {
      hook = await ch.createWebhook({ name: HOOK_NAME, reason: 'E-Forge: feed GitHub' });
      created = true;
    }

    const base = hook.url;
    log.info('[efg] GOTOWE.', { kanał: ch.name, utworzony: created });
    console.log(
      `\n✅ E-Forge hub: webhook „${HOOK_NAME}" ${created ? 'utworzony' : 'już istniał'} w #${ch.name}.\n\n` +
        `   🔗 URL webhooka (SEKRET — nie udostępniaj publicznie):\n   ${base}\n\n` +
        `   ➡️ Na GitHubie, w KAŻDYM repo (E-Bot, E-OS):\n` +
        `      Settings → Webhooks → Add webhook\n` +
        `      • Payload URL:  ${base}/github      ← DOPISZ /github na końcu!\n` +
        `      • Content type: application/json\n` +
        `      • Events:       „Just the push event" (lub Let me select → Pushes, Pull requests, Releases)\n` +
        `      • Add webhook\n\n` +
        `   Od tej chwili commity/PR-y/wydania lecą na #${ch.name}.\n`,
    );
  } catch (e) {
    log.error('[efg] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
