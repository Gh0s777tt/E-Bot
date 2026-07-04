// Discovery B5 (#685) — „Zsynchronizuj komendy" z panelu. Problem (P8): rejestracja komend była
// wyłącznie ręczna (skrypt deploy-commands.mts w terminalu). Panel (owner, /diagnostics) zapisuje
// żądanie do klucza settings 'deploy_commands_request' ({ts, by}); ten serwis polluje co 30 s
// i wykonuje globalną rejestrację (IDENTYCZNY zestaw co deploy-commands.mts), a wynik zapisuje
// do 'deploy_commands_result' ({ok, count|error, requestTs, ts}). Bez chmury / bez env — nieaktywny.
// Pod shardingiem działa tylko shard 0 (rejestracja globalna jest jedna dla całej aplikacji).
import { type Client, REST, Routes } from 'discord.js';
import { contextCommands } from '../commands/contextmenu.mts';
import { commands } from '../commands/index.mts';
import { reportMenuData } from '../community/reports.mts';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';
import { pendingRequestTs } from './command-sync.logic.mts';

const POLL_MS = 30_000;

async function deployAll(): Promise<number> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const appId = process.env.DISCORD_CLIENT_ID;
  if (!token || !appId) throw new Error('brak DISCORD_BOT_TOKEN lub DISCORD_CLIENT_ID');
  const body = [
    ...commands.map((c) => c.data.toJSON()),
    ...contextCommands.map((c) => c.data.toJSON()),
    reportMenuData.toJSON(),
  ];
  const rest = new REST().setToken(token);
  const data = (await rest.put(Routes.applicationCommands(appId), { body })) as unknown[];
  return data.length;
}

export function startCommandSync(client: Client): void {
  if (!hasCloud()) return;
  if (client.shard && !client.shard.ids.includes(0)) return; // globalny PUT robi tylko shard 0
  let busy = false;
  const tick = async (): Promise<void> => {
    if (busy) return;
    busy = true;
    try {
      const [reqRaw, resRaw] = await Promise.all([
        cloudGetSetting('deploy_commands_request'),
        cloudGetSetting('deploy_commands_result'),
      ]);
      const ts = pendingRequestTs(reqRaw, resRaw);
      if (ts === null) return;
      try {
        const count = await deployAll();
        await cloudSetSetting(
          'deploy_commands_result',
          JSON.stringify({ ok: true, count, requestTs: ts, ts: Date.now() }),
        );
        log.info(`command-sync: zarejestrowano ${count} komend globalnie (żądanie z panelu).`);
      } catch (e) {
        await cloudSetSetting(
          'deploy_commands_result',
          JSON.stringify({
            ok: false,
            error: (e as Error).message.slice(0, 200),
            requestTs: ts,
            ts: Date.now(),
          }),
        );
        log.error(`command-sync: rejestracja nie powiodła się: ${(e as Error).message}`);
      }
    } catch {
      /* chwilowy błąd chmury — kolejny tick spróbuje ponownie */
    } finally {
      busy = false;
    }
  };
  setInterval(() => void tick(), POLL_MS);
  void tick();
}
