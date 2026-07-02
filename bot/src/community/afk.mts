// Faza 7 / F7.3 — AFK: /afk ustawia status (w pamięci); powrót czyści przy następnej wiadomości,
// a wzmianka osoby AFK → bot informuje. Config 'afk_config' {enabled}. Bez tabeli (status ulotny).

import { type Client, Events, type Message } from 'discord.js';
import { getGuildSettings, settingsEpoch } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type AfkEntry = { reason: string; since: number };
const afk = new Map<string, AfkEntry>();

// Etap K — config per-serwer; cache invalidowany epoką ustawień (hit między zapisami, świeżo po zmianie).
const _afkCache = new Map<string, { v: boolean; epoch: number }>();
export function afkEnabled(guildId: string): boolean {
  const e = settingsEpoch();
  const hit = _afkCache.get(guildId);
  if (hit && hit.epoch === e) return hit.v;
  const raw = getGuildSettings(guildId).afk_config;
  let v = false;
  try {
    v = raw ? !!(JSON.parse(raw) as { enabled?: boolean }).enabled : false;
  } catch {
    v = false;
  }
  _afkCache.set(guildId, { v, epoch: e });
  return v;
}

export function setAfk(userId: string, reason: string): void {
  afk.set(userId, { reason, since: Date.now() });
}

export function startAfk(client: Client): void {
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !msg.guild || !afkEnabled(msg.guild.id)) return;

    // Powrót: autor był AFK → usuń status.
    if (afk.has(msg.author.id)) {
      afk.delete(msg.author.id);
      await msg.reply('👋 Witaj z powrotem! Usunąłem Twój status AFK.').catch(() => {});
    }

    // Wzmianka osoby AFK → poinformuj (raz na wiadomość, nawet przy wielu wzmiankach).
    for (const u of msg.mentions.users.values()) {
      const entry = afk.get(u.id);
      if (entry && u.id !== msg.author.id) {
        await msg.reply(`💤 <@${u.id}> jest teraz AFK: ${entry.reason}`).catch(() => {});
        break;
      }
    }
  });

  log.info('[afk] AFK aktywne (config z panelu).');
}
