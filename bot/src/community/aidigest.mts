// Tor J — dzienny AI-digest: o wskazanej godzinie (UTC) bot streszcza ostatnie wiadomości kanału
// źródłowego i wysyła embed na kanał docelowy. Config 'aidigest_config'; model z 'ai_config'.
// Dedup przez setting 'aidigest_last' (data). Poller co 30 min.
import { type Client, EmbedBuilder, type TextChannel } from 'discord.js';
import { aiConfig, callModel } from '../lib/ai.mts';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

type Cfg = { on: boolean; sourceId: string; targetId: string; hour: number };
function cfg(): Cfg {
  const raw = getSettings()['aidigest_config'];
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

async function maybePost(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const c = cfg();
  if (!c.on || !c.sourceId || !c.targetId) return;
  const ai = aiConfig();
  if (!ai.enabled) return;
  const now = new Date();
  if (now.getUTCHours() !== c.hour) return;
  const day = now.toISOString().slice(0, 10);
  if ((await cloudGetSetting('aidigest_last').catch(() => null)) === day) return;

  const src = await client.channels.fetch(c.sourceId).catch(() => null);
  if (!src?.isTextBased() || !('messages' in src)) {
    await cloudSetSetting('aidigest_last', day).catch(() => {});
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
    await cloudSetSetting('aidigest_last', day).catch(() => {});
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
    const tgt = await client.channels.fetch(c.targetId).catch(() => null);
    if (tgt?.isTextBased() && 'send' in tgt) {
      const embed = new EmbedBuilder()
        .setColor(0xe50914)
        .setTitle('🧠 Dzienne podsumowanie kanału')
        .setDescription((summary || '(brak treści)').slice(0, 4000))
        .setTimestamp(now);
      await (tgt as TextChannel).send({ embeds: [embed] }).catch(() => {});
    }
  } catch (e) {
    console.warn('[aidigest]', (e as Error).message);
  }
  await cloudSetSetting('aidigest_last', day).catch(() => {});
}

export function startAiDigest(client: Client): void {
  console.log('[aidigest] aktywny (dzienny, config z panelu).');
  void maybePost(client);
  setInterval(
    () => void maybePost(client).catch((e) => console.warn('[aidigest]', (e as Error).message)),
    30 * 60_000,
  );
}
