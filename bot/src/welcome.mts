// Powitania + autorole (Faza 6) + baner-grafika (Faza 7/F2). Config z panelu ('welcome_config').

import {
  type APIEmbed,
  AttachmentBuilder,
  type Client,
  Events,
  type GuildMember,
} from 'discord.js';
import { type CardStyle, renderWelcomeBanner } from './lib/cards.mts';
import { getGuildSettings } from './lib/db.mts';
import { log } from './lib/log.mts';
import {
  buildRichMessage,
  embedHasContent,
  hasRich,
  type RichMessage,
} from './lib/richMessage.mts';

type WelcomeConfig = {
  enabled: boolean;
  channelId: string;
  message: string;
  autoroleId: string;
  cardEnabled?: boolean;
  card?: Partial<CardStyle>;
  messageSpec?: RichMessage;
  autoroleDelaySec?: number;
};
const DEF: WelcomeConfig = { enabled: false, channelId: '', message: '', autoroleId: '' };

// Etap K — config per-serwer: czytany ŚWIEŻO przy każdym wejściu (rzadkie zdarzenie, więc bez
// cache). getGuildSettings nadpisuje globalny welcome_config override'em serwera (fallback global).
function loadConfig(guildId: string): WelcomeConfig {
  const raw = getGuildSettings(guildId).welcome_config;
  if (!raw) return { ...DEF };
  try {
    return { ...DEF, ...(JSON.parse(raw) as Partial<WelcomeConfig>) };
  } catch {
    return { ...DEF };
  }
}

export function startWelcome(client: Client): void {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    const cfg = loadConfig(member.guild.id);
    if (!cfg.enabled) return;
    try {
      if (cfg.autoroleId) {
        const roleId = cfg.autoroleId;
        const delay = Math.max(0, cfg.autoroleDelaySec ?? 0);
        if (delay > 0) {
          // Anty-raid: nadaj rolę dopiero po opóźnieniu i tylko, jeśli członek nadal jest na serwerze.
          setTimeout(() => {
            void member.guild.members
              .fetch(member.id)
              .then((m) => m.roles.add(roleId))
              .catch(() => {});
          }, delay * 1000);
        } else {
          await member.roles.add(roleId).catch(() => {});
        }
      }
      if (!cfg.channelId) return;
      const hasContent = !!cfg.message || hasRich(cfg.messageSpec);
      if (!hasContent && !cfg.cardEnabled) return;

      const ch = await member.guild.channels.fetch(cfg.channelId).catch(() => null);
      if (!ch?.isTextBased() || !('send' in ch)) return;

      const ping = `<@${member.id}>`;
      const vars: Record<string, string> = {
        '{user}': ping,
        '{username}': member.user.username,
        '{server}': member.guild.name,
        '{memberCount}': String(member.guild.memberCount),
      };
      const spec = cfg.messageSpec;

      let content: string | undefined = ping;
      let embeds: APIEmbed[] = [];

      if (spec?.useEmbed && embedHasContent(spec.embed)) {
        // Embed z Message Studio (panel)
        const built = buildRichMessage(spec, vars);
        content = built.content ?? ping;
        embeds = built.embeds;
      } else {
        // Klasyczny wygląd: czerwony embed z treścią + avatar (wstecznie zgodne)
        let text = spec?.content ?? cfg.message ?? '';
        for (const [k, v] of Object.entries(vars)) text = text.split(k).join(v);
        if (text.trim()) {
          embeds = [
            {
              color: 0xe50914,
              description: text,
              thumbnail: { url: member.user.displayAvatarURL() },
            },
          ];
        }
      }

      // Baner-grafika (Faza 7/F2): gradient + czcionka z panelu → obraz pierwszego embeda
      if (cfg.cardEnabled) {
        try {
          const buf = await renderWelcomeBanner({
            username: member.user.username,
            avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
            text:
              (spec?.content ?? cfg.message ?? '')
                .replaceAll('{user}', member.user.username)
                .slice(0, 50) || 'Witaj!',
            style: cfg.card,
          });
          if (!embeds.length) embeds = [{ color: 0xe50914 }];
          const first = embeds[0];
          if (first) first.image = { url: 'attachment://welcome.png' };
          await ch
            .send({ content, embeds, files: [new AttachmentBuilder(buf, { name: 'welcome.png' })] })
            .catch(() => {});
          return;
        } catch (e) {
          log.warn('[welcome] baner:', { err: e });
        }
      }
      await ch.send({ content, embeds }).catch(() => {});
    } catch (e) {
      log.warn('[welcome]', { err: e });
    }
  });

  log.info('[welcome] aktywny (powitania + autorole; config z panelu).');
}
