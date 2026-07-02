// Tor C — AI-pomoc (RAG-lite): na wskazanym kanale bot odpowiada na pytania WYŁĄCZNIE na podstawie
// bazy wiedzy (FAQ/regulamin) wklejonej w panelu. Bez embeddingów — wiedza wstrzykiwana w prompt
// (działa dla krótkich FAQ). Config 'aihelp_config'; korzysta z modelu z 'ai_config'.

import { type Client, Events, type Message, type TextChannel } from 'discord.js';
import { aiConfig, callModel } from '../lib/ai.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type Cfg = { on: boolean; channelId: string; knowledge: string };
// Config PER-SERWER: cache TTL 30 s per guild (override `g:<id>:aihelp_config` z fallbackiem do globalnego).
const cfgCache = new Map<string, { cfg: Cfg; at: number }>();
function cfgFor(guildId: string): Cfg {
  const hit = cfgCache.get(guildId);
  if (hit && Date.now() - hit.at < 30_000) return hit.cfg;
  const raw = getGuildSettings(guildId).aihelp_config;
  let cfg: Cfg;
  try {
    const c = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    cfg = {
      on: !!c.enabled,
      channelId: String(c.channelId || ''),
      knowledge: String(c.knowledge || ''),
    };
  } catch {
    cfg = { on: false, channelId: '', knowledge: '' };
  }
  cfgCache.set(guildId, { cfg, at: Date.now() });
  return cfg;
}

const cooldown = new Map<string, number>();

export function startAiHelp(client: Client): void {
  log.info('[aihelp] aktywne (config z panelu).');
  client.on(Events.MessageCreate, async (msg: Message) => {
    try {
      if (msg.author.bot || !msg.guild) return;
      const c = cfgFor(msg.guild.id);
      if (!c.on || msg.channelId !== c.channelId) return;
      const q = msg.content.trim();
      if (q.length < 6) return; // ignoruj krótkie/śmieciowe
      const ai = aiConfig();
      if (!ai.enabled) return;
      const now = Date.now();
      if (now - (cooldown.get(msg.author.id) ?? 0) < 10_000) return; // 10 s / użytkownik
      cooldown.set(msg.author.id, now);

      await (msg.channel as TextChannel).sendTyping().catch(() => {});
      const system =
        'Jesteś asystentem pomocy serwera Discord. Odpowiadaj zwięźle, po polsku, WYŁĄCZNIE na ' +
        'podstawie poniższej wiedzy. Jeśli nie znajdziesz odpowiedzi — napisz, że nie wiesz i ' +
        `poproś o kontakt z obsługą.\n\n=== WIEDZA ===\n${c.knowledge.slice(0, 6000)}`;
      const { text } = await callModel(
        ai.model,
        [
          { role: 'system', content: system },
          { role: 'user', content: q },
        ],
        400,
      );
      if (text) await msg.reply(text.slice(0, 1900)).catch(() => {});
    } catch (e) {
      log.warn('[aihelp]', { err: e });
    }
  });
}
