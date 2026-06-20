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

const SUBS_REFRESH_MS = 5 * 60_000; // jak często bot odświeża zbiór słów-kluczy messageCreate z panelu

// Baza panelu (tylko https — sekret leci w nagłówku Bearer). null = brak/niepoprawna konfiguracja.
function baseUrl(): string | null {
  const base = (process.env.PLUGIN_BRIDGE_URL || '').trim().replace(/\/+$/, '');
  if (!base || !/^https:\/\//i.test(base)) return null;
  return base;
}

// Cache słów-kluczy messageCreate per-serwer (guildId → keywordy). Pusty = nic nie forwardujemy na
// wiadomości. Odświeżany pollem z /api/internal/plugin-subscriptions (wzorzec jak settings-sync).
let msgSubs = new Map<string, string[]>();

// Fire-and-forget: forward zdarzenia do panelu. Sekret w nagłówku Bearer (jak bot↔GH0ST).
async function sendEvent(event: string, guildId: string, input: unknown): Promise<void> {
  const base = baseUrl();
  const secret = process.env.PLUGIN_BRIDGE_SECRET || '';
  if (!base || !secret) return;
  try {
    const r = await fetch(`${base}/api/internal/plugin-event`, {
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

// Pobranie z panelu mapy guildId → słowa-klucze (pluginy messageCreate). Cache podmieniamy atomowo;
// przy błędzie zostaje poprzedni (bot nie „głuchnie" na chwilowy problem sieci/panelu).
async function refreshSubs(): Promise<void> {
  const base = baseUrl();
  const secret = process.env.PLUGIN_BRIDGE_SECRET || '';
  if (!base || !secret) return;
  try {
    const r = await fetch(`${base}/api/internal/plugin-subscriptions`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) {
      log.warn('plugin-bridge: pobranie subskrypcji nieudane', { status: r.status });
      return;
    }
    const j = (await r.json().catch(() => ({}))) as { subs?: Record<string, string[]> };
    const next = new Map<string, string[]>();
    for (const [gid, kws] of Object.entries(j.subs ?? {})) {
      if (Array.isArray(kws) && kws.length) next.set(gid, kws);
    }
    msgSubs = next;
  } catch (e) {
    log.warn('plugin-bridge: błąd pobierania subskrypcji', { err: e });
  }
}

export function startPluginBridge(client: Client): void {
  if (!baseUrl() || !process.env.PLUGIN_BRIDGE_SECRET) {
    log.info('plugin-bridge: brak PLUGIN_BRIDGE_URL/SECRET (https) — pominięto');
    return;
  }
  // Boty pomijamy we wszystkich zdarzeniach (mniej szumu/amplifikacji przy raidach).

  // Nowy członek (powitania / role startowe).
  client.on(Events.GuildMemberAdd, (member) => {
    if (member.user.bot) return;
    void sendEvent('guildMemberAdd', member.guild.id, {
      userId: member.id,
      username: member.user.username,
    });
  });

  // Odejście członka (pożegnania / sprzątanie).
  client.on(Events.GuildMemberRemove, (member) => {
    if (member.user.bot) return;
    void sendEvent('guildMemberRemove', member.guild.id, {
      userId: member.id,
      username: member.user.username,
    });
  });

  // Boost: guildMemberUpdate odpala się często, ale forwardujemy TYLKO przejście w boost
  // (premiumSince: brak → ustawione) — rzadkie i wartościowe („dziękujemy za boost").
  // Partial-oldMember pomijamy: nie znamy poprzedniego stanu → ryzyko fałszywego triggera.
  client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
    if (oldMember.partial) return;
    const startedBoosting = !oldMember.premiumSince && !!newMember.premiumSince;
    if (!startedBoosting || newMember.user.bot) return;
    void sendEvent('guildBoost', newMember.guild.id, {
      userId: newMember.id,
      username: newMember.user.username,
    });
  });

  // messageCreate: WYSOKA częstotliwość → forwardujemy WYŁĄCZNIE wiadomości zawierające słowo-klucz
  // zadeklarowane przez plugin (cache `msgSubs` z panelu). Bez dopasowania = zero ruchu do panelu.
  // Panel filtruje jeszcze per-plugin (autorytatywnie); tu jest tylko tania bramka częstotliwości.
  client.on(Events.MessageCreate, (msg) => {
    if (!msg.guild || msg.author.bot || !msg.content) return;
    const kws = msgSubs.get(msg.guild.id);
    if (!kws?.length) return;
    const lc = msg.content.toLowerCase();
    if (!kws.some((k) => lc.includes(k.toLowerCase()))) return;
    void sendEvent('messageCreate', msg.guild.id, {
      userId: msg.author.id,
      channelId: msg.channelId,
      content: msg.content.slice(0, 500),
    });
  });

  void refreshSubs();
  setInterval(() => void refreshSubs(), SUBS_REFRESH_MS);
  log.info('plugin-bridge: aktywny (member lifecycle + messageCreate[keyword] → panel)');
}
