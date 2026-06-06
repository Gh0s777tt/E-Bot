// Faza 6 / B7 — alerty błędów bota na Discord (throttling 1/min). Kanał: settings 'alert_channel_id'
// lub 'notify_channel_id'. Najlepszy wysiłek — nigdy nie rzuca (wywoływane z handlerów procesu).
import type { Client, TextChannel } from 'discord.js';
import { getSettings } from '../lib/db.mts';

let lastAlert = 0;

function alertChannelId(): string {
  const s = getSettings();
  return s['alert_channel_id'] || s['notify_channel_id'] || '';
}

export async function notifyError(client: Client, label: string, err: unknown): Promise<void> {
  try {
    const now = Date.now();
    if (now - lastAlert < 60_000) return; // throttle: maks 1 alert / min
    lastAlert = now;
    const id = alertChannelId();
    if (!id) return;
    const ch = await client.channels.fetch(id).catch(() => null);
    if (!ch?.isTextBased() || !('send' in ch)) return;
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    await (ch as TextChannel)
      .send(`🛑 **Błąd bota** (\`${label}\`):\n\`\`\`${msg.slice(0, 1500)}\`\`\``)
      .catch(() => {});
  } catch {
    /* alert nie może wywrócić procesu */
  }
}
