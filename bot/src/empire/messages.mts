// GH0ST EMPIRE economy — award GT for Discord messages (anti-spam cooldown per user).
// Requires the MessageContent privileged intent (added in index.mts only when economy is on).
import { type Client, Events, type Message } from 'discord.js';
import { awardTokens } from './award.mts';
import { economy } from './config.mts';

// Optional: scope earning to one server (the community guild). Unset = any guild E-Bot is in.
const GUILD_ID = process.env.DISCORD_GUILD_ID || process.env.GHOST_GUILD_ID || '';

const cooldowns = new Map<string, number>();
// Prune so the map doesn't grow unbounded over long uptimes.
setInterval(() => {
  const cutoff = Date.now() - economy.messageCooldownSeconds * 1000;
  for (const [id, ts] of cooldowns) if (ts < cutoff) cooldowns.delete(id);
}, 5 * 60_000);

export function setupMessageEarning(client: Client): void {
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (!economy.enabled) return;
    if (msg.author.bot || !msg.guild) return;
    if (GUILD_ID && msg.guild.id !== GUILD_ID) return;
    if (msg.content.trim().length < 2) return; // ignore stickers / 1-char spam
    if (msg.content.startsWith('!') || msg.content.startsWith('/')) return; // ignore commands

    const last = cooldowns.get(msg.author.id) ?? 0;
    const now = Date.now();
    if (now - last < economy.messageCooldownSeconds * 1000) return;
    cooldowns.set(msg.author.id, now);

    const r = await awardTokens({
      discordId: msg.author.id,
      amount: economy.messageReward,
      reason: 'message',
    });
    if ('ok' in r && r.ok && 'awarded' in r) {
      console.log(`[empire/msg] ${msg.author.username} +${r.awarded} GT → ${r.newBalance}`);
    }
  });
}
