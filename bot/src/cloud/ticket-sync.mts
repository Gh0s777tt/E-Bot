// Faza 4 — domyka pętlę ticketów: gdy ticket zamknięto Z PANELU (status=closed w Supabase),
// bot archiwizuje i blokuje odpowiadający wątek na Discordzie. (Zamknięcie z Discorda przez
// /ticket zamknij robi to od razu — tu wątek jest już zarchiwizowany, więc pomijamy.)
import type { Client, ThreadChannel } from "discord.js";
import { cloudSelect, hasCloud } from "../lib/cloud.mts";

const handled = new Set<string>();

export function startTicketSync(client: Client): void {
  if (!hasCloud()) {
    console.log("[ticket-sync] brak Supabase — pomijam.");
    return;
  }

  const sync = async (): Promise<void> => {
    try {
      const rows = await cloudSelect<{ channel_id: string | null }>(
        "tickets",
        "select=channel_id&status=eq.closed&channel_id=not.is.null&order=closed_at.desc&limit=50",
      );
      for (const r of rows) {
        const chId = r.channel_id;
        if (!chId || handled.has(chId)) continue;
        const ch = await client.channels.fetch(chId).catch(() => null);
        if (ch && "isThread" in ch && ch.isThread()) {
          const thread = ch as ThreadChannel;
          if (!thread.archived) {
            await thread.setLocked(true).catch(() => {});
            await thread.setArchived(true).catch(() => {});
            console.log(`[ticket-sync] zarchiwizowano wątek ${chId} (zamknięty z panelu).`);
          }
        }
        handled.add(chId); // nie próbuj ponownie tego samego ticketu
      }
    } catch (e) {
      console.warn("[ticket-sync]", (e as Error).message);
    }
  };

  void sync();
  setInterval(() => void sync(), 60_000);
  console.log("[ticket-sync] archiwizacja wątków zamkniętych z panelu (co 60s).");
}
