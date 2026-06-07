// Tor C — AI-pomoc (RAG-lite): na wskazanym kanale bot odpowiada na pytania WYŁĄCZNIE na podstawie
// bazy wiedzy (FAQ/regulamin) wklejonej w panelu. Bez embeddingów — wiedza wstrzykiwana w prompt
// (działa dla krótkich FAQ). Config 'aihelp_config'; korzysta z modelu z 'ai_config'.
import { type Client, Events, type Message, type TextChannel } from 'discord.js';
import { aiConfig, callModel } from '../lib/ai.mts';
import { getSettings } from '../lib/db.mts';

type Cfg = { on: boolean; channelId: string; knowledge: string };
function cfg(): Cfg {
  const raw = getSettings()['aihelp_config'];
  try {
    const c = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return {
      on: !!c.enabled,
      channelId: String(c.channelId || ''),
      knowledge: String(c.knowledge || ''),
    };
  } catch {
    return { on: false, channelId: '', knowledge: '' };
  }
}

const cooldown = new Map<string, number>();

export function startAiHelp(client: Client): void {
  console.log('[aihelp] aktywne (config z panelu).');
  client.on(Events.MessageCreate, async (msg: Message) => {
    try {
      if (msg.author.bot || !msg.guild) return;
      const c = cfg();
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
      console.warn('[aihelp]', (e as Error).message);
    }
  });
}
