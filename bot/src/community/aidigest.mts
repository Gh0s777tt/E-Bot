// Tor J — dzienny AI-digest: o wskazanej godzinie (UTC) bot streszcza ostatnie wiadomości kanału
// źródłowego i wysyła embed na kanał docelowy. Config 'aidigest_config' (PER-SERWER); model z 'ai_config'.
// Dedup przez setting 'g:<id>:aidigest_last' (data, PER-SERWER). Poller co 30 min iteruje gildie.
import { type Client, EmbedBuilder, type Guild, type TextChannel } from 'discord.js';
import { aiConfig, callModel } from '../lib/ai.mts';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type Cfg = { on: boolean; sourceId: string; targetId: string; hour: number };
function cfgFor(guildId: string): Cfg {
  const raw = getGuildSettings(guildId)['aidigest_config'];
  try {
    const c = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return {
      on: !!c.enabled,
      sourceId: String(c.sourceChannelId || ''),
      targetId: String(c.targetChannelId || ''),
      hour: Number(c.hourUTC ?? 18),
    };
  } catch {
    return { on: false, sourceId: '', targetId: '', hour: 18 };
  }
}

// Digest JEDNEGO serwera: config + dedup per-serwer; `guild.channels.fetch` zwraca TYLKO kanały tej
// gildii → naturalna izolacja multi-tenant (źródło/cel nie wycieknie na inny serwer).
async function maybePostForGuild(guild: Guild): Promise<void> {
  const c = cfgFor(guild.id);
  if (!c.on || !c.sourceId || !c.targetId) return;
  const ai = aiConfig();
  if (!ai.enabled) return;
  const now = new Date();
  if (now.getUTCHours() !== c.hour) return;
  const day = now.toISOString().slice(0, 10);
  const lastKey = `g:${guild.id}:aidigest_last`;
  if ((await cloudGetSetting(lastKey).catch(() => null)) === day) return;

  const src = await guild.channels.fetch(c.sourceId).catch(() => null);
  if (!src?.isTextBased() || !('messages' in src)) {
    await cloudSetSetting(lastKey, day).catch(() => {});
    return;
  }
  const msgs = await (src as TextChannel).messages.fetch({ limit: 80 }).catch(() => null);
  const text = msgs
    ? [...msgs.values()]
        .reverse()
        .filter((m) => !m.author.bot && m.content)
        .map((m) => `${m.author.username}: ${m.content}`)
        .join('\n')
        .slice(0, 8000)
    : '';
  if (text.length < 50) {
    await cloudSetSetting(lastKey, day).catch(() => {});
    return;
  }
  try {
    const { text: summary } = await callModel(
      ai.model,
      [
        {
          role: 'system',
          content:
            'Streszczasz dzienną aktywność kanału Discord po polsku. Zwięźle, 5–8 punktów: najważniejsze tematy, pytania, decyzje. Bez zmyślania.',
        },
        { role: 'user', content: text },
      ],
      500,
    );
    const tgt = await guild.channels.fetch(c.targetId).catch(() => null);
    if (tgt?.isTextBased() && 'send' in tgt) {
      const embed = new EmbedBuilder()
        .setColor(0xe50914)
        .setTitle('🧠 Dzienne podsumowanie kanału')
        .setDescription((summary || '(brak treści)').slice(0, 4000))
        .setTimestamp(now);
      await (tgt as TextChannel).send({ embeds: [embed] }).catch(() => {});
    }
  } catch (e) {
    log.warn('[aidigest]', { err: e });
  }
  await cloudSetSetting(lastKey, day).catch(() => {});
}

async function maybePost(client: Client): Promise<void> {
  if (!hasCloud()) return;
  for (const guild of client.guilds.cache.values()) {
    await maybePostForGuild(guild).catch(() => {});
  }
}

export function startAiDigest(client: Client): void {
  log.info('[aidigest] aktywny (dzienny per-serwer, config z panelu).');
  void maybePost(client);
  setInterval(
    () => void maybePost(client).catch((e) => log.warn('[aidigest]', { err: e })),
    30 * 60_000,
  );
}
