// Most bot→dashboard — auto-trigger pluginów community na realne zdarzenia Discorda.
// Bot NIE wykonuje obcego kodu: tylko forwarduje zdarzenie do audytowanego endpointu panelu
// (/api/internal/plugin-event), który rozsyła je do włączonych+zatwierdzonych pluginów przez cały
// sandbox (runner+executor, 6 warstw strażników: SSRF, HMAC, scoped, anty-eskalacja). Tu zostaje
// wyłącznie cienki forwarder — żadnej logiki bezpieczeństwa po stronie bota do audytu.
//
// Domyślnie WYŁĄCZONE — aktywne tylko gdy ustawisz OBA: PLUGIN_BRIDGE_URL (baza panelu, https)
// + PLUGIN_BRIDGE_SECRET (ten sam sekret co w env panelu). Bez nich — no-op (zero listenerów).
import { type Client, Events } from 'discord.js';
import { log } from '../lib/log.mts';

// Pełny URL endpointu mostu z bazy panelu (tylko https). null = brak/niepoprawna konfiguracja.
function endpoint(): string | null {
  const base = (process.env.PLUGIN_BRIDGE_URL || '').trim().replace(/\/+$/, '');
  if (!base || !/^https:\/\//i.test(base)) return null; // wymagamy https (sekret leci w nagłówku)
  return `${base}/api/internal/plugin-event`;
}

// Fire-and-forget: forward zdarzenia do panelu. Sekret w nagłówku Bearer (jak bot↔GH0ST).
async function sendEvent(event: string, guildId: string, input: unknown): Promise<void> {
  const url = endpoint();
  const secret = process.env.PLUGIN_BRIDGE_SECRET || '';
  if (!url || !secret) return;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ guildId, event, input }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) log.warn('plugin-bridge: panel odrzucił zdarzenie', { event, status: r.status });
  } catch (e) {
    log.warn('plugin-bridge: błąd wysyłki zdarzenia', { event, err: e });
  }
}

export function startPluginBridge(client: Client): void {
  if (!endpoint() || !process.env.PLUGIN_BRIDGE_SECRET) {
    log.info('plugin-bridge: brak PLUGIN_BRIDGE_URL/SECRET (https) — pominięto');
    return;
  }
  // Pierwsze zdarzenie reaktywne: nowy członek serwera (kanoniczny trigger powitań/community).
  // Pomijamy boty — mniej szumu i mniejsza amplifikacja przy raidach.
  client.on(Events.GuildMemberAdd, (member) => {
    if (member.user.bot) return;
    void sendEvent('guildMemberAdd', member.guild.id, {
      userId: member.id,
      username: member.user.username,
    });
  });
  log.info('plugin-bridge: aktywny (guildMemberAdd → panel)');
}
