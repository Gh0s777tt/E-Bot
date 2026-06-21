// Onboarding — gdy bot zostaje DODANY do nowego serwera, wysyła właścicielowi DM z powitaniem,
// quick-startem i (opcjonalnie) linkiem do panelu. WAŻNE: Events.GuildCreate odpala się też przy
// starcie dla serwerów już cache'owanych — filtrujemy po joinedTimestamp (tylko świeże dołączenia),
// żeby NIE spamować właścicieli istniejących serwerów przy każdym restarcie bota.

import { type Client, EmbedBuilder, Events, type Guild } from 'discord.js';
import { log } from './lib/log.mts';

export function startOnboarding(client: Client): void {
  client.on(Events.GuildCreate, async (guild: Guild) => {
    try {
      // Tylko genuine nowe dołączenie (≤60 s temu). Sync startowy istniejących guildów ma stary timestamp.
      if (Date.now() - (guild.joinedTimestamp ?? 0) > 60_000) return;

      const owner = await guild.fetchOwner().catch(() => null);
      if (!owner) return;
      const panel = process.env.DASHBOARD_URL?.trim();
      const embed = new EmbedBuilder()
        .setColor(0xe50914)
        .setTitle('🎬 Dzięki za dodanie E-Bota!')
        .setDescription(
          `Cześć! Jestem teraz na **${guild.name}**. Szybki start:\n\n` +
            '**1.** `/help` — wszystkie komendy w kategoriach (jest też wyszukiwarka `szukaj`).\n' +
            '**2.** `/tutorial` — interaktywny przewodnik krok po kroku.\n' +
            '**3.** Włącz moduły (powitania, moderacja, poziomy, ekonomia, tickety…) w panelu web.\n' +
            (panel
              ? `\n🔧 **Panel:** ${panel}`
              : '\n🔧 Konfiguracja przez panel web (dashboard).') +
            '\n\nKażdy serwer ma własną, niezależną konfigurację. Miłej zabawy! 🚀',
        )
        .setFooter({ text: `Serwer: ${guild.name} • ${guild.memberCount} członków` });
      await owner.send({ embeds: [embed] }).catch(() => {
        /* właściciel ma zamknięte DM — trudno, nie spamujemy kanałów serwera */
      });
      log.info(`[onboarding] dołączono do „${guild.name}" (${guild.id}) — DM do właściciela.`);
    } catch (e) {
      log.warn('[onboarding]', { err: e });
    }
  });
  log.info('[onboarding] aktywne (DM powitalny do właściciela przy dołączeniu do serwera).');
}
