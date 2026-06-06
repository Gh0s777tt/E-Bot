// Automod (Faza 6) — anti-invite / anti-link / limit wzmianek / anty-spam + mod-log.
// Config z panelu (settings 'automod_config'). Wymaga intencji MessageContent (treść).
import { type Client, EmbedBuilder, Events, type Message, PermissionFlagsBits } from "discord.js";
import { getSettings } from "./lib/db.mts";

type AutomodConfig = {
  enabled: boolean;
  blockInvites: boolean;
  blockLinks: boolean;
  maxMentions: number;
  antiSpamCount: number;
  antiSpamSec: number;
  modlogChannelId: string;
  exemptRoleId: string;
};
const DEFAULT: AutomodConfig = {
  enabled: false,
  blockInvites: true,
  blockLinks: false,
  maxMentions: 6,
  antiSpamCount: 6,
  antiSpamSec: 5,
  modlogChannelId: "",
  exemptRoleId: "",
};
let cfg: AutomodConfig = { ...DEFAULT };

function refresh(): void {
  const raw = getSettings()["automod_config"];
  cfg = raw ? { ...DEFAULT, ...(safeParse(raw) ?? {}) } : { ...DEFAULT };
}
function safeParse(s: string): Partial<AutomodConfig> | null {
  try {
    return JSON.parse(s) as Partial<AutomodConfig>;
  } catch {
    return null;
  }
}

const INVITE = /(discord\.gg|discord(app)?\.com\/invite)\/\S+/i;
const LINK = /https?:\/\/\S+/i;
const recent = new Map<string, number[]>();
setInterval(
  () => {
    const cut = Date.now() - 60_000;
    for (const [k, v] of recent) if (!v.some((t) => t > cut)) recent.delete(k);
  },
  5 * 60_000,
);

export function startAutomod(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);

  client.on(Events.MessageCreate, async (msg: Message) => {
    if (!cfg.enabled || msg.author.bot || !msg.guild) return;
    const member = msg.member;
    if (member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;
    if (cfg.exemptRoleId && member?.roles.cache.has(cfg.exemptRoleId)) return;

    const content = msg.content || "";
    let reason = "";
    if (cfg.blockInvites && INVITE.test(content)) reason = "zaproszenie Discord";
    else if (cfg.blockLinks && LINK.test(content)) reason = "link";
    else if (cfg.maxMentions > 0 && msg.mentions.users.size + msg.mentions.roles.size > cfg.maxMentions)
      reason = "zbyt wiele wzmianek";
    else if (cfg.antiSpamCount > 0) {
      const now = Date.now();
      const arr = (recent.get(msg.author.id) ?? []).filter((t) => now - t < cfg.antiSpamSec * 1000);
      arr.push(now);
      recent.set(msg.author.id, arr);
      if (arr.length > cfg.antiSpamCount) reason = "spam";
    }
    if (!reason) return;

    try {
      await msg.delete().catch(() => {});
      if (cfg.modlogChannelId) {
        const ch = await msg.guild.channels.fetch(cfg.modlogChannelId).catch(() => null);
        if (ch?.isTextBased() && "send" in ch) {
          const embed = new EmbedBuilder()
            .setColor(0xe50914)
            .setTitle("🛡️ Automod")
            .setDescription(`Usunięto wiadomość od <@${msg.author.id}>`)
            .addFields(
              { name: "Powód", value: reason, inline: true },
              { name: "Kanał", value: `<#${msg.channelId}>`, inline: true },
            )
            .setTimestamp(new Date());
          if (content) embed.addFields({ name: "Treść", value: content.slice(0, 300) });
          await ch.send({ embeds: [embed] }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn("[automod]", (e as Error).message);
    }
  });

  console.log("[automod] aktywny (config z panelu).");
}
