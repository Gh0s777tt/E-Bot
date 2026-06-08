// No-code komendy slash. Config w settings 'custom_commands' (JSON). Panel rejestruje je w Discord
// przez REST (POST upsert per komenda — NIE rusza wbudowanych) i kasuje usunięte. Bot obsługuje
// wywołania (bot/src/commands/customCommands.mts). 'custom_commands_registered' = nasze nazwy (do
// bezpiecznego kasowania tylko swoich).
import { getRawSetting, setRawSetting } from './data';
import { getPrimaryGuildId } from './guild';
import { normalizeRich, type RichMessage } from './richMessage';

export type CommandOption = { name: string; description: string; required: boolean };
export type CustomCommand = {
  name: string;
  description: string;
  response: RichMessage;
  ephemeral: boolean;
  options?: CommandOption[];
  type?: 'message' | 'random' | 'role';
  randomLines?: string[];
  roleId?: string;
  cooldownSec?: number;
};

export async function getCustomCommands(): Promise<CustomCommand[]> {
  const raw = await getRawSetting('custom_commands');
  if (!raw) return [];
  try {
    const a = JSON.parse(raw) as CustomCommand[];
    return Array.isArray(a) ? a.map((c) => ({ ...c, response: normalizeRich(c.response) })) : [];
  } catch {
    return [];
  }
}

async function dfetch(path: string, init?: RequestInit): Promise<Response | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return null;
  return fetch(`https://discord.com/api/v10${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  }).catch(() => null);
}

let appIdCache = '';
async function getAppId(): Promise<string> {
  if (appIdCache) return appIdCache;
  const r = await dfetch('/applications/@me');
  if (!r?.ok) return '';
  const j = (await r.json()) as { id?: string };
  appIdCache = j.id ?? '';
  return appIdCache;
}

export type SyncResult = { ok: boolean; error?: string; registered: number };

// Zapis configu + synchronizacja z Discord. Zwraca błąd przy kolizji z komendą wbudowaną.
export async function saveCustomCommands(commands: CustomCommand[]): Promise<SyncResult> {
  const appId = await getAppId();
  const guildId = await getPrimaryGuildId();
  if (!appId || !guildId) {
    // bez Discorda: zapisz sam config (bot i tak nie obsłuży bez rejestracji, ale nie tracimy danych)
    await setRawSetting('custom_commands', JSON.stringify(commands));
    return {
      ok: false,
      error: 'Brak appId/guildId (token bota?). Config zapisany, rejestracja pominięta.',
      registered: 0,
    };
  }
  const base = `/applications/${appId}/guilds/${guildId}/commands`;

  const exR = await dfetch(base);
  const existing = exR?.ok ? ((await exR.json()) as { id: string; name: string }[]) : [];

  let prevNames: string[] = [];
  try {
    prevNames = JSON.parse((await getRawSetting('custom_commands_registered')) || '[]') as string[];
  } catch {
    prevNames = [];
  }
  const newNames = commands.map((c) => c.name);

  // kolizja z wbudowaną: nazwa istnieje w guildzie, a NIE rejestrowaliśmy jej my
  const collision = commands.find(
    (c) => existing.some((e) => e.name === c.name) && !prevNames.includes(c.name),
  );
  if (collision) {
    return {
      ok: false,
      error: `Nazwa „/${collision.name}" jest już zajęta przez komendę wbudowaną — wybierz inną.`,
      registered: 0,
    };
  }

  await setRawSetting('custom_commands', JSON.stringify(commands));

  let registered = 0;
  for (const c of commands) {
    // opcje (typ 3 = STRING); Discord wymaga: wymagane PRZED opcjonalnymi
    const options = (c.options ?? [])
      .filter((o) => o.name)
      .slice(0, 25)
      .map((o) => ({
        type: 3,
        name: o.name,
        description: o.description || o.name,
        required: !!o.required,
      }))
      .sort((a, b) => Number(b.required) - Number(a.required));
    const r = await dfetch(base, {
      method: 'POST',
      body: JSON.stringify({
        name: c.name,
        description: c.description || c.name,
        type: 1,
        ...(options.length ? { options } : {}),
      }),
    });
    if (r?.ok) registered++;
  }
  // usuń tylko nasze, które zniknęły z configu
  for (const name of prevNames) {
    if (newNames.includes(name)) continue;
    const found = existing.find((e) => e.name === name);
    if (found) await dfetch(`${base}/${found.id}`, { method: 'DELETE' });
  }
  await setRawSetting('custom_commands_registered', JSON.stringify(newNames));
  return { ok: true, registered };
}
