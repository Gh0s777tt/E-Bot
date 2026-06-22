// Faza 7 / F5 — serwis ticketów: otwieranie (przycisk/modal), zamykanie z TRANSKRYPTEM + oceną.

import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  type TextChannel,
  type ThreadChannel,
  type User,
} from 'discord.js';
import { cloudInsert, cloudSelect, cloudUpdate, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import type { RichMessage } from '../lib/richMessage.mts';

export type TicketCategory = {
  id: string;
  label: string;
  emoji: string;
  style: 'primary' | 'secondary' | 'success' | 'danger';
  supportRoleId: string;
  welcome: string;
};
export type TicketsConfig = {
  enabled: boolean;
  supportRoleId: string;
  welcome: string;
  logChannelId: string;
  panelMessage: string;
  panelSpec?: RichMessage;
  categories?: TicketCategory[];
  ratingEnabled: boolean;
  slaHours: number; // Tor D — auto-close po bezczynności (0 = off)
  questions?: string[]; // Etap H — dodatkowe pytania formularza przed otwarciem (max 4)
};

// Etap K — config per-serwer: świeży odczyt (low-freq: klik/komenda/poller), fallback global.
export function ticketConfig(guildId: string): TicketsConfig {
  const def: TicketsConfig = {
    enabled: false,
    supportRoleId: '',
    welcome: 'Dzięki za zgłoszenie! Obsługa odezwie się wkrótce.',
    logChannelId: '',
    panelMessage: 'Masz sprawę? Otwórz ticket — kliknij poniżej. 🎟️',
    categories: [],
    ratingEnabled: true,
    slaHours: 0,
    questions: [],
  };
  const raw = getGuildSettings(guildId)['tickets_config'];
  try {
    return raw ? { ...def, ...(JSON.parse(raw) as Partial<TicketsConfig>) } : def;
  } catch {
    return def;
  }
}

function controlsRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket:claim')
      .setLabel('Przejmij')
      .setEmoji('🙋')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('ticket:close')
      .setLabel('Zamknij ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger),
  );
}

function ratingRow(channelId: string): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>();
  for (let n = 1; n <= 5; n++) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket:rate:${channelId}:${n}`)
        .setLabel(String(n))
        .setEmoji('⭐')
        .setStyle(ButtonStyle.Secondary),
    );
  }
  return row;
}

export async function openTicket(
  channel: TextChannel,
  user: User,
  subject: string,
  catId?: string,
): Promise<ThreadChannel | null> {
  const cfg = ticketConfig(channel.guildId);
  const cat = (cfg.categories ?? []).find((c) => c.id === catId);
  const roleId = cat?.supportRoleId || cfg.supportRoleId;
  const welcomeRaw = (cat?.welcome || cfg.welcome || '').trim();
  const labeledSubject = cat ? `[${cat.label}] ${subject}` : subject;
  try {
    const thread = await channel.threads.create({
      name: `ticket-${cat ? `${cat.label}-` : ''}${user.username}`.slice(0, 90),
      type: ChannelType.PrivateThread,
      invitable: false,
    });
    await thread.members.add(user.id).catch(() => {});
    const ping = roleId ? `<@&${roleId}> ` : '';
    const welcome = welcomeRaw
      .replaceAll('{user}', `<@${user.id}>`)
      .replaceAll('{subject}', subject);
    await thread
      .send({
        content: `${ping}${welcome}\n\n**Temat:** ${subject}\n— <@${user.id}>`,
        components: [controlsRow()],
      })
      .catch(() => {});
    if (hasCloud()) {
      await cloudInsert('tickets', [
        {
          guild_id: channel.guildId,
          channel_id: thread.id,
          user_id: user.id,
          username: user.username,
          subject: labeledSubject,
          status: 'open',
        },
      ]).catch((e) => log.warn('[ticket]', { err: e }));
    }
    return thread;
  } catch (e) {
    log.warn('[ticket] open:', { err: e });
    return null;
  }
}

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function buildTranscript(thread: ThreadChannel): Promise<Buffer> {
  const msgs = await thread.messages.fetch({ limit: 100 }).catch(() => null);
  const arr = msgs ? [...msgs.values()].reverse() : [];
  const rows = arr
    .map(
      (m) =>
        `<div style="margin:6px 0"><b style="color:#e50914">${esc(m.author?.username ?? '?')}</b> <span style="color:#888;font-size:12px">${new Date(m.createdTimestamp).toLocaleString('pl-PL')}</span><br>${esc(m.content || '')}</div>`,
    )
    .join('\n');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(thread.name)}</title></head><body style="background:#0a0a0a;color:#eee;font-family:system-ui,sans-serif;padding:24px;max-width:800px;margin:auto"><h2>🎟️ Transkrypt: ${esc(thread.name)}</h2><hr style="border-color:#222">${rows || '<i>brak wiadomości</i>'}</body></html>`;
  return Buffer.from(html, 'utf-8');
}

export async function closeTicket(
  thread: ThreadChannel,
  opts: { skipStatusUpdate?: boolean } = {},
): Promise<void> {
  const cfg = ticketConfig(thread.guild.id);
  let openerId = '';
  if (hasCloud()) {
    const rows = await cloudSelect<{ user_id: string }>(
      'tickets',
      `select=user_id&channel_id=eq.${thread.id}&limit=1`,
    );
    openerId = rows[0]?.user_id ?? '';
  }

  const transcript = await buildTranscript(thread);
  const fileName = `transcript-${thread.id}.html`;

  if (cfg.logChannelId) {
    const ch = await thread.guild.channels.fetch(cfg.logChannelId).catch(() => null);
    if (ch?.isTextBased() && 'send' in ch) {
      await (ch as TextChannel)
        .send({
          content: `🎟️ Ticket zamknięty: **${thread.name}**`,
          files: [new AttachmentBuilder(transcript, { name: fileName })],
        })
        .catch(() => {});
    }
  }

  if (openerId) {
    const user = await thread.client.users.fetch(openerId).catch(() => null);
    if (user) {
      await user
        .send({
          content: `Twój ticket **${thread.name}** został zamknięty. Transkrypt w załączniku.${cfg.ratingEnabled ? '\nOceń obsługę:' : ''}`,
          files: [new AttachmentBuilder(transcript, { name: fileName })],
          components: cfg.ratingEnabled ? [ratingRow(thread.id)] : [],
        })
        .catch(() => {});
    }
  }

  if (!opts.skipStatusUpdate && hasCloud()) {
    await cloudUpdate('tickets', `channel_id=eq.${thread.id}&status=neq.closed`, {
      status: 'closed',
      closed_at: new Date().toISOString(),
    }).catch(() => {});
  }
  // Transkrypt HTML do Supabase, by panel mógł go wyświetlić (/api/tickets/transcript). GRACEFUL:
  // gdy kolumna 'transcript_html' nie istnieje (brak ALTER), update cicho pada → zero regresji;
  // kanał logów, DM i status zamknięcia powyżej są nietknięte.
  if (hasCloud()) {
    await cloudUpdate('tickets', `channel_id=eq.${thread.id}`, {
      transcript_html: transcript.toString('utf-8'),
    }).catch(() => {});
  }
  await thread.setLocked(true).catch(() => {});
  await thread.setArchived(true).catch(() => {});
}
