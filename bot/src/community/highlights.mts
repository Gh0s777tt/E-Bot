// Faza 7 / F7.3 — highlighty: użytkownik rejestruje słowa (/highlight), bot DM-uje go, gdy słowo
// padnie w wiadomości innej osoby (z poszanowaniem dostępu do kanału). Config 'highlights_config'.

import { type Client, EmbedBuilder, Events, type Message, PermissionFlagsBits } from 'discord.js';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings, settingsEpoch } from '../lib/db.mts';
import { log } from '../lib/log.mts';

export type HL = { user_id: string; word: string };
let cache: HL[] = [];
const cooldown = new Map<string, number>(); // user:channel → ts

// Czysty rdzeń dopasowania highlightów: zwraca pierwszy pasujący wpis na użytkownika.
// POMIJA autora (bez auto-powiadomienia o własnej wiadomości) i DEDUPLIKUJE (jeden user raz na
// wiadomość, choćby pasowało kilka jego słów). Dopasowanie case-insensitive (substring, jak `.includes`).
// Cooldown / uprawnienia kanału / DM = sprawa callera.
export function highlightTargets(cache: HL[], content: string, authorId: string): HL[] {
  const lower = content.toLowerCase();
  const seen = new Set<string>();
  const out: HL[] = [];
  for (const h of cache) {
    if (h.user_id === authorId || seen.has(h.user_id)) continue;
    if (!lower.includes(h.word.toLowerCase())) continue;
    seen.add(h.user_id);
    out.push(h);
  }
  return out;
}

// Etap K — config per-serwer; cache invalidowany epoką ustawień (hit między zapisami, świeżo po zmianie).
const _hlCache = new Map<string, { v: boolean; epoch: number }>();
export function highlightsEnabled(guildId: string): boolean {
  const e = settingsEpoch();
  const hit = _hlCache.get(guildId);
  if (hit && hit.epoch === e) return hit.v;
  const raw = getGuildSettings(guildId).highlights_config;
  let v = false;
  try {
    v = raw ? !!(JSON.parse(raw) as { enabled?: boolean }).enabled : false;
  } catch {
    v = false;
  }
  _hlCache.set(guildId, { v, epoch: e });
  return v;
}

async function refreshCache(): Promise<void> {
  if (!hasCloud()) return;
  cache = await cloudSelect<HL>('highlights', 'select=user_id,word&limit=2000');
}

export function startHighlights(client: Client): void {
  if (!hasCloud()) {
    log.info('[highlights] brak chmury — highlighty wyłączone.');
    return;
  }
  void refreshCache();
  setInterval(() => void refreshCache().catch(() => {}), 60_000);

  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !msg.guild || !highlightsEnabled(msg.guild.id)) return;
    const content = (msg.content || '').toLowerCase();
    if (!content || !cache.length) return;
    const ch = msg.channel;
    if (!('permissionsFor' in ch)) return;

    for (const h of highlightTargets(cache, msg.content || '', msg.author.id)) {
      const key = `${h.user_id}:${msg.channelId}`;
      const now = Date.now();
      if ((cooldown.get(key) ?? 0) + 60_000 > now) continue;

      const member = await msg.guild.members.fetch(h.user_id).catch(() => null);
      if (!member || !ch.permissionsFor(member)?.has(PermissionFlagsBits.ViewChannel)) continue;
      cooldown.set(key, now);

      await member.user
        .send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xe50914)
              .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
              .setDescription(
                `🔔 Twoje słowo **${h.word}** padło w <#${msg.channelId}>:\n${(msg.content || '').slice(0, 300)}\n\n[Skok do wiadomości](${msg.url})`,
              )
              .setTimestamp(new Date()),
          ],
        })
        .catch(() => {});
    }
  });

  log.info('[highlights] highlighty aktywne (config z panelu, cache 60s).');
}
