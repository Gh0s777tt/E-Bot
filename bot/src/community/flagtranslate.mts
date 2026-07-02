// Tłumaczenie flagą: gdy ktoś doda do wiadomości reakcję z flagą kraju (np. 🇵🇱, 🇬🇧), bot odpowiada
// tłumaczeniem jej treści na język tej flagi (przez AI, wspólne limity ai_usage). Config
// 'flagtranslate_config' PER-SERWER {enabled}. Bez tabeli. Wymaga włączonego AI w panelu.
import {
  type Client,
  Events,
  type MessageReaction,
  type PartialMessageReaction,
  type PartialUser,
  type User,
} from 'discord.js';
import { aiConfig, bumpUsage, callModel, checkUsage } from '../lib/ai.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean };
const DEFAULT: Cfg = { enabled: false };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId).flagtranslate_config, DEFAULT);
}

// Kraj (ISO-2) → polska nazwa języka docelowego. Pokrywa 14 języków bota + kilka popularnych.
const COUNTRY_LANG: Record<string, string> = {
  GB: 'angielski',
  US: 'angielski',
  AU: 'angielski',
  CA: 'angielski',
  IE: 'angielski',
  PL: 'polski',
  DE: 'niemiecki',
  AT: 'niemiecki',
  FR: 'francuski',
  ES: 'hiszpański',
  MX: 'hiszpański',
  AR: 'hiszpański',
  IT: 'włoski',
  PT: 'portugalski',
  BR: 'portugalski',
  RU: 'rosyjski',
  UA: 'ukraiński',
  JP: 'japoński',
  KR: 'koreański',
  CN: 'chiński',
  TW: 'chiński',
  HK: 'chiński',
  SA: 'arabski',
  AE: 'arabski',
  EG: 'arabski',
  ID: 'indonezyjski',
  NL: 'niderlandzki',
  TR: 'turecki',
  SE: 'szwedzki',
  NO: 'norweski',
  DK: 'duński',
  FI: 'fiński',
  CZ: 'czeski',
  RO: 'rumuński',
  HU: 'węgierski',
  GR: 'grecki',
  VN: 'wietnamski',
  TH: 'tajski',
  IN: 'hindi',
};

// Emoji flagi = dwa „regional indicator" (U+1F1E6..U+1F1FF). Zamieniamy na kod kraju ISO-2.
function emojiToCountry(emoji: string): string | null {
  const cps = [...emoji]
    .map((c) => c.codePointAt(0) ?? 0)
    .filter((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff);
  if (cps.length < 2) return null;
  const a = String.fromCharCode((cps[0] ?? 0) - 0x1f1e6 + 65);
  const b = String.fromCharCode((cps[1] ?? 0) - 0x1f1e6 + 65);
  return a + b;
}

// Czysta, testowalna: flaga → polska nazwa języka, albo null gdy to nie znana flaga.
export function flagToLang(emoji: string): string | null {
  const cc = emojiToCountry(emoji);
  return cc ? (COUNTRY_LANG[cc] ?? null) : null;
}

// Dedup (messageId:lang → ts) — nie tłumaczymy tego samego dwa razy; leniwe czyszczenie po 10 min.
const recent = new Map<string, number>();
function seen(key: string): boolean {
  const now = Date.now();
  if (recent.size > 1000) for (const [k, t] of recent) if (now - t > 600_000) recent.delete(k);
  if (recent.has(key) && now - (recent.get(key) ?? 0) < 600_000) return true;
  recent.set(key, now);
  return false;
}

export function startFlagTranslate(client: Client): void {
  client.on(
    Events.MessageReactionAdd,
    async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
      try {
        if (user.bot) return;
        const lang = flagToLang(reaction.emoji.name ?? '');
        if (!lang) return;
        const r = reaction.partial ? await reaction.fetch() : reaction;
        const msg = r.message.partial ? await r.message.fetch() : r.message;
        if (!msg.guild) return;
        if (!cfgFor(msg.guild.id).enabled) return;
        const text = msg.content?.trim();
        if (!text) return;

        const cfg = aiConfig();
        if (!cfg.enabled) return;
        if (seen(`${msg.id}:${lang}`)) return;
        const usage = await checkUsage(user.id, msg.guild.id, cfg);
        if (usage.limited) return; // limit AI wyczerpany — cicho pomijamy (jest /translate z komunikatem)

        const { text: out, tokens } = await callModel(
          cfg.model,
          [
            {
              role: 'system',
              content: `Jesteś tłumaczem. Przetłumacz tekst użytkownika na język: ${lang}. Zwróć WYŁĄCZNIE tłumaczenie, bez komentarzy i bez oryginału.`,
            },
            { role: 'user', content: text.slice(0, 1500) },
          ],
          800,
        );
        await bumpUsage(user.id, usage, tokens);
        await msg
          .reply({
            content: `🌐 **→ ${lang}:**\n${out}`.slice(0, 1900),
            allowedMentions: { repliedUser: false },
          })
          .catch(() => {});
      } catch (e) {
        log.warn('[flagtranslate]', { err: e });
      }
    },
  );
  log.info('[flagtranslate] tłumaczenie flagą aktywne (config z panelu, wymaga AI).');
}
