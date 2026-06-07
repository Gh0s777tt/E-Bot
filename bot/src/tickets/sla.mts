// Tor D — SLA: automatyczne zamykanie ticketów bez aktywności po `slaHours` godzin.
// Poller co 30 min; sprawdza otwarte/przejęte tickety i wiek ostatniej wiadomości w wątku.
import type { Client } from 'discord.js';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';
import { closeTicket, ticketConfig } from './service.mts';

export function startTicketSla(client: Client): void {
  console.log('[ticket-sla] aktywne (config z panelu).');
  setInterval(async () => {
    try {
      const cfg = ticketConfig();
      if (!cfg.enabled || !cfg.slaHours || !hasCloud()) return;
      const rows = await cloudSelect<{ channel_id: string }>(
        'tickets',
        'select=channel_id&status=in.(open,claimed)&limit=100',
      ).catch(() => [] as { channel_id: string }[]);
      const cutoff = Date.now() - cfg.slaHours * 3_600_000;
      for (const r of rows) {
        if (!r.channel_id) continue;
        const ch = await client.channels.fetch(r.channel_id).catch(() => null);
        if (!ch?.isThread()) continue;
        const last = await ch.messages.fetch({ limit: 1 }).catch(() => null);
        const lastTs = last?.first()?.createdTimestamp ?? ch.createdTimestamp ?? 0;
        if (lastTs < cutoff) {
          await ch.send('🕒 Ticket zamknięty automatycznie po bezczynności (SLA).').catch(() => {});
          await closeTicket(ch);
        }
      }
    } catch (e) {
      console.warn('[ticket-sla]', (e as Error).message);
    }
  }, 30 * 60_000);
}
