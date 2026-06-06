// Faza 7 / F7.3 — urodziny: dzienny poller ogłasza solenizantów + opcjonalna rola na dany dzień.
// Config 'birthday_config', dane w Supabase 'birthdays'. Dedup po dacie w cloud setting 'birthday_last'.
import type { Client, TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSelect, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

type BirthdayConfig = { enabled: boolean; channelId: string; message: string; roleId: string };
const DEFAULT: BirthdayConfig = {
  enabled: false,
  channelId: '',
  message: '🎉 Dziś urodziny obchodzi {users}! Wszystkiego najlepszego! 🎂',
  roleId: '',
};
let cfg: BirthdayConfig = { ...DEFAULT };

function refresh(): void {
  const raw = getSettings()['birthday_config'];
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<BirthdayConfig>) } : { ...DEFAULT };
  } catch {
    /* zostaw poprzedni */
  }
}

async function tick(client: Client): Promise<void> {
  if (!cfg.enabled || !cfg.channelId || !hasCloud()) return;
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  if ((await cloudGetSetting('birthday_last').catch(() => null)) === todayKey) return;

  const ch = await client.channels.fetch(cfg.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('guild' in ch)) return;
  const guild = (ch as TextChannel).guild;
  const rows = await cloudSelect<{ user_id: string }>(
    'birthdays',
    `select=user_id&guild_id=eq.${guild.id}&day=eq.${now.getUTCDate()}&month=eq.${now.getUTCMonth() + 1}`,
  );
  const ids = rows.map((r) => r.user_id);

  if (cfg.roleId) {
    const role = await guild.roles.fetch(cfg.roleId).catch(() => null);
    if (role) {
      for (const mem of role.members.values()) {
        if (!ids.includes(mem.id)) await mem.roles.remove(cfg.roleId).catch(() => {});
      }
      for (const id of ids) {
        const mem = await guild.members.fetch(id).catch(() => null);
        await mem?.roles.add(cfg.roleId).catch(() => {});
      }
    }
  }

  if (ids.length) {
    const text = cfg.message.replaceAll('{users}', ids.map((i) => `<@${i}>`).join(', '));
    await (ch as TextChannel).send(text).catch(() => {});
  }
  await cloudSetSetting('birthday_last', todayKey).catch(() => {});
}

export function startBirthdays(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  if (!hasCloud()) {
    console.log('[birthdays] brak chmury — urodziny wyłączone.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => console.warn('[birthdays]', (e as Error).message)),
    3_600_000, // co godzinę; ogłasza raz dziennie (dedup po dacie)
  );
  console.log('[birthdays] urodziny aktywne (poll 1h, config z panelu).');
}
