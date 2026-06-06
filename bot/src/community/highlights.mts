// Faza 7 / F7.3 — highlighty: użytkownik rejestruje słowa (/highlight), bot DM-uje go, gdy słowo
// padnie w wiadomości innej osoby (z poszanowaniem dostępu do kanału). Config 'highlights_config'.
import { type Client, EmbedBuilder, Events, type Message, PermissionFlagsBits } from 'discord.js';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

type HL = { user_id: string; word: string };
let cache: HL[] = [];
const cooldown = new Map<string, number>(); // user:channel → ts

export function highlightsEnabled(): boolean {
  const raw = getSettings()['highlights_config'];
  try {
    return raw ? !!(JSON.parse(raw) as { enabled?: boolean }).enabled : false;
  } catch {
    return false;
  }
}

async function refreshCache(): Promise<void> {
  if (!hasCloud()) return;
  cache = await cloudSelect<HL>('highlights', 'select=user_id,word&limit=2000');
}

export function startHighlights(client: Client): void {
  if (!hasCloud()) {
    console.log('[highlights] brak chmury — highlighty wyłączone.');
    return;
  }
  void refreshCache();
  setInterval(() => void refreshCache().catch(() => {}), 60_000);

  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !msg.guild || !highlightsEnabled()) return;
    const content = (msg.content || '').toLowerCase();
    if (!content || !cache.length) return;
    const ch = msg.channel;
    if (!('permissionsFor' in ch)) return;

    const notified = new Set<string>();
    for (const h of cache) {
      if (h.user_id === msg.author.id || notified.has(h.user_id)) continue;
      if (!content.includes(h.word.toLowerCase())) continue;
      notified.add(h.user_id);

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

  console.log('[highlights] highlighty aktywne (config z panelu, cache 60s).');
}
