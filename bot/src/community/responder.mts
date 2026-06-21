// Faza 7 / F7.2 — komendy własne (prefiks np. !regulamin) + autoresponder (słowa-klucze → odpowiedź).
// Config z panelu (settings 'responder_config'). Bez SQL, bez komend slash. Zmienne: {user}, {server}.

import { type Client, Events, type Message } from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type Cmd = { name: string; response: string };
type Auto = { trigger: string; response: string; match: 'contains' | 'exact' | 'starts' };
type ResponderConfig = {
  enabled: boolean;
  prefix: string;
  commands: Cmd[];
  autoresponders: Auto[];
};

const DEFAULT: ResponderConfig = { enabled: false, prefix: '!', commands: [], autoresponders: [] };

// Etap K — config per-serwer z cache TTL 30 s (handler chodzi na każdej wiadomości).
const cfgCache = new Map<string, { cfg: ResponderConfig; at: number }>();
function cfgFor(guildId: string): ResponderConfig {
  const hit = cfgCache.get(guildId);
  if (hit && Date.now() - hit.at < 30_000) return hit.cfg;
  const raw = getGuildSettings(guildId)['responder_config'];
  let cfg: ResponderConfig;
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<ResponderConfig>) } : { ...DEFAULT };
  } catch {
    cfg = { ...DEFAULT };
  }
  cfgCache.set(guildId, { cfg, at: Date.now() });
  return cfg;
}

function fill(s: string, msg: Message): string {
  return s
    .replaceAll('{user}', `<@${msg.author.id}>`)
    .replaceAll('{server}', msg.guild?.name ?? '');
}

export function startResponder(client: Client): void {
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !msg.guild) return;
    const cfg = cfgFor(msg.guild.id);
    if (!cfg.enabled) return;
    const content = msg.content ?? '';
    if (!content) return;

    // Komendy własne: prefiks + nazwa (pierwsze słowo).
    if (cfg.prefix && content.startsWith(cfg.prefix)) {
      const name = content.slice(cfg.prefix.length).split(/\s+/)[0]?.toLowerCase();
      const cmd = name && cfg.commands.find((c) => c.name.toLowerCase() === name);
      if (cmd) {
        await msg.reply(fill(cmd.response, msg)).catch(() => {});
        return;
      }
    }

    // Autoresponder: pierwszy pasujący trigger.
    const lc = content.toLowerCase();
    for (const a of cfg.autoresponders) {
      const t = a.trigger.toLowerCase();
      if (!t) continue;
      const hit =
        a.match === 'exact' ? lc === t : a.match === 'starts' ? lc.startsWith(t) : lc.includes(t);
      if (hit) {
        await msg.reply(fill(a.response, msg)).catch(() => {});
        return;
      }
    }
  });

  log.info('[responder] komendy własne + autoresponder aktywne (config z panelu).');
}
