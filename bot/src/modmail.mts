// Faza 7 / F6.4 — modmail: DM do bota ↔ prywatny wątek na kanale obsługi (relay obustronny).
// Config z panelu (settings 'modmail_config'). Mapowanie użytkownik↔wątek w Supabase 'modmail_threads'
// (wymaga f6-modmail-schema.sql). Wymaga intencji DirectMessages (dodana w index.mts) + Partials.Channel.

import {
  ChannelType,
  type Client,
  EmbedBuilder,
  Events,
  type Message,
  type TextChannel,
  type ThreadChannel,
} from 'discord.js';
import { cloudInsert, cloudSelect, cloudUpdate, hasCloud } from './lib/cloud.mts';
import { getGuildSettings } from './lib/db.mts';
import { log } from './lib/log.mts';

type ModmailConfig = { enabled: boolean; channelId: string; greeting: string };
const DEFAULT: ModmailConfig = {
  enabled: false,
  channelId: '',
  greeting: 'Twoja wiadomość trafiła do obsługi. Odpiszemy najszybciej, jak to możliwe. 📨',
};
// Etap K — config per-serwer: świeży odczyt (low-freq: DM/relay), fallback global.
function modmailConfig(guildId: string): ModmailConfig {
  const raw = getGuildSettings(guildId)['modmail_config'];
  try {
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<ModmailConfig>) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}

type Row = { id: string; user_id: string; channel_id: string };

export function relayBody(msg: Message): string {
  const atts = [...msg.attachments.values()].map((a) => a.url).join('\n');
  return `${msg.content || ''}${atts ? `\n${atts}` : ''}`.trim() || '*(brak treści)*';
}

// DM autora → modmail KAŻDEGO serwera, na którym autor jest członkiem i modmail jest włączony.
// (DM nie ma kontekstu serwera — dlatego iterujemy po wspólnych serwerach z włączonym modmailem.)
async function inbound(client: Client, msg: Message): Promise<void> {
  if (!hasCloud()) return;
  let delivered = false;
  for (const guild of client.guilds.cache.values()) {
    const gcfg = modmailConfig(guild.id);
    if (!gcfg.enabled || !gcfg.channelId) continue;
    const isMember = await guild.members
      .fetch(msg.author.id)
      .then(() => true)
      .catch(() => false);
    if (!isMember) continue;
    const ok = await relayInbound(client, msg, gcfg).catch((e) => {
      log.warn('[modmail] in:', { err: e });
      return false;
    });
    if (ok) delivered = true;
  }
  if (delivered) await msg.react('📨').catch(() => {});
}

// Relay DM do modmaila JEDNEGO serwera (gcfg). Zwraca true, jeśli dostarczono.
async function relayInbound(client: Client, msg: Message, gcfg: ModmailConfig): Promise<boolean> {
  const parent = await client.channels.fetch(gcfg.channelId).catch(() => null);
  if (!parent || !('threads' in parent) || parent.type !== ChannelType.GuildText) return false;
  const text = parent as TextChannel;

  const existing = await cloudSelect<Row>(
    'modmail_threads',
    `select=id,user_id,channel_id&guild_id=eq.${text.guildId}&user_id=eq.${msg.author.id}&open=eq.true&order=created_at.desc&limit=1`,
  );
  let row: Row | null = existing[0] ?? null;
  let thread: ThreadChannel | null = null;
  if (row) {
    thread = (await client.channels
      .fetch(row.channel_id)
      .catch(() => null)) as ThreadChannel | null;
    if (!thread || thread.archived) {
      await cloudUpdate('modmail_threads', `id=eq.${row.id}`, { open: false }).catch(() => {});
      row = null;
      thread = null;
    }
  }

  let isNew = false;
  if (!thread) {
    // Odwołanie od bana? Jeśli piszący jest zbanowany, oznacz wątek jako APEL + pokaż powód bana.
    const ban = await text.guild.bans.fetch(msg.author.id).catch(() => null);
    const banReason = ban ? ban.reason || 'brak podanego powodu' : null;

    thread = await text.threads
      .create({
        name: `${banReason ? '🚫 APEL' : '📨'} ${msg.author.username}`.slice(0, 90),
        type: ChannelType.PublicThread,
      })
      .catch(() => null);
    if (!thread) return false;
    isNew = true;
    await cloudInsert('modmail_threads', [
      { guild_id: text.guildId, user_id: msg.author.id, channel_id: thread.id, open: true },
    ]).catch((e) => log.warn('[modmail]', { err: e }));
    await thread
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe50914)
            .setTitle(banReason ? '🚫 Odwołanie od bana' : '📨 Nowy modmail')
            .setDescription(
              banReason
                ? `Od <@${msg.author.id}> (${msg.author.tag})\nID: ${msg.author.id}\n**Status: ZBANOWANY** — powód: ${banReason}\n\nOdpowiedz w wątku (→ DM). \`!unban\` cofa bana, \`!close\` zamyka.`
                : `Od <@${msg.author.id}> (${msg.author.tag})\nID: ${msg.author.id}\nOdpowiedz w tym wątku — trafi w DM. \`!close\` zamyka rozmowę.`,
            ),
        ],
      })
      .catch(() => {});
  }

  await thread
    .send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x3ba55d)
          .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
          .setDescription(relayBody(msg))
          .setTimestamp(new Date()),
      ],
    })
    .catch(() => {});

  if (isNew && gcfg.greeting) await msg.author.send(gcfg.greeting).catch(() => {});
  return true;
}

// Wiadomość obsługi w wątku modmaila → DM do użytkownika (lub !close).
async function outbound(client: Client, msg: Message): Promise<void> {
  if (!hasCloud()) return;
  const thread = msg.channel as ThreadChannel;
  const rows = await cloudSelect<Row>(
    'modmail_threads',
    `select=id,user_id,channel_id&channel_id=eq.${thread.id}&open=eq.true&limit=1`,
  );
  const row = rows[0];
  if (!row) return;

  if (msg.content.trim().toLowerCase() === '!close') {
    await cloudUpdate('modmail_threads', `id=eq.${row.id}`, { open: false }).catch(() => {});
    const user = await client.users.fetch(row.user_id).catch(() => null);
    await user
      ?.send('📪 Rozmowa z obsługą została zamknięta. Napisz ponownie, aby otworzyć nową.')
      .catch(() => {});
    await thread.send('📪 Modmail zamknięty.').catch(() => {});
    await thread.setArchived(true).catch(() => {});
    return;
  }

  // Akceptacja odwołania — cofnięcie bana użytkownika z wątku.
  if (msg.content.trim().toLowerCase() === '!unban') {
    let ok = false;
    try {
      await thread.guild.bans.remove(
        row.user_id,
        `Modmail: odwołanie zaakceptowane przez ${msg.author.tag}`,
      );
      ok = true;
    } catch {
      /* brak bana lub uprawnień bota */
    }
    const u = await client.users.fetch(row.user_id).catch(() => null);
    if (ok) await u?.send('✅ Twój ban został cofnięty — możesz wrócić na serwer.').catch(() => {});
    await thread
      .send(
        ok
          ? `✅ Cofnięto bana <@${row.user_id}>.`
          : '❌ Nie udało się cofnąć bana (brak bana lub uprawnień bota).',
      )
      .catch(() => {});
    await msg.react(ok ? '✅' : '⚠️').catch(() => {});
    return;
  }

  const user = await client.users.fetch(row.user_id).catch(() => null);
  if (!user) return;
  await user
    .send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xe50914)
          .setAuthor({ name: `${msg.author.username} • obsługa` })
          .setDescription(relayBody(msg))
          .setTimestamp(new Date()),
      ],
    })
    .catch(() => {});
  await msg.react('✅').catch(() => {});
}

export function startModmail(client: Client): void {
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot) return;
    if (!msg.guild) {
      // DM → inbound sam sprawdza per-serwer (po wszystkich wspólnych serwerach).
      await inbound(client, msg).catch((e) => log.warn('[modmail] in:', { err: e }));
      return;
    }
    // Wiadomość w wątku: czy to wątek modmaila TEGO serwera?
    if (msg.channel.isThread()) {
      const gcfg = modmailConfig(msg.guild.id);
      if (gcfg.enabled && msg.channel.parentId === gcfg.channelId) {
        await outbound(client, msg).catch((e) => log.warn('[modmail] out:', { err: e }));
      }
    }
  });

  log.info('[modmail] modmail aktywny (config per-serwer z panelu).');
}
