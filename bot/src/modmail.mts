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
import { getSettings } from './lib/db.mts';

type ModmailConfig = { enabled: boolean; channelId: string; greeting: string };
const DEFAULT: ModmailConfig = {
  enabled: false,
  channelId: '',
  greeting: 'Twoja wiadomość trafiła do obsługi. Odpiszemy najszybciej, jak to możliwe. 📨',
};
let cfg: ModmailConfig = { ...DEFAULT };

function refresh(): void {
  const raw = getSettings()['modmail_config'];
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<ModmailConfig>) } : { ...DEFAULT };
  } catch {
    /* zostaw poprzedni */
  }
}

type Row = { id: string; user_id: string; channel_id: string };

function relayBody(msg: Message): string {
  const atts = [...msg.attachments.values()].map((a) => a.url).join('\n');
  return `${msg.content || ''}${atts ? `\n${atts}` : ''}`.trim() || '*(brak treści)*';
}

// DM od użytkownika → wątek na kanale obsługi.
async function inbound(client: Client, msg: Message): Promise<void> {
  if (!cfg.enabled || !cfg.channelId || !hasCloud()) return;
  const parent = await client.channels.fetch(cfg.channelId).catch(() => null);
  if (!parent || !('threads' in parent) || parent.type !== ChannelType.GuildText) return;
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
    thread = await text.threads
      .create({ name: `📨 ${msg.author.username}`.slice(0, 90), type: ChannelType.PublicThread })
      .catch(() => null);
    if (!thread) return;
    isNew = true;
    await cloudInsert('modmail_threads', [
      { guild_id: text.guildId, user_id: msg.author.id, channel_id: thread.id, open: true },
    ]).catch((e) => console.warn('[modmail]', (e as Error).message));
    await thread
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe50914)
            .setTitle('📨 Nowy modmail')
            .setDescription(
              `Od <@${msg.author.id}> (${msg.author.tag})\nID: ${msg.author.id}\nOdpowiedz w tym wątku — trafi w DM. \`!close\` zamyka rozmowę.`,
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

  if (isNew && cfg.greeting) await msg.author.send(cfg.greeting).catch(() => {});
  await msg.react('📨').catch(() => {});
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
  refresh();
  setInterval(refresh, 30_000);

  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !cfg.enabled) return;
    if (!msg.guild) {
      await inbound(client, msg).catch((e) => console.warn('[modmail] in:', (e as Error).message));
      return;
    }
    if (msg.channel.isThread() && msg.channel.parentId === cfg.channelId) {
      await outbound(client, msg).catch((e) =>
        console.warn('[modmail] out:', (e as Error).message),
      );
    }
  });

  console.log('[modmail] modmail aktywny (config z panelu).');
}
