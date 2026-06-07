// Tor E — tygodniowy auto-digest serwera (poniedziałek UTC). Sumuje activity_daily z 7 dni
// i wysyła embed na wybrany kanał. Dedup przez setting 'digest_last' (tag tygodnia).
import { type Client, EmbedBuilder, type TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSelect, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

type Cfg = { on: boolean; channelId: string };
function cfg(): Cfg {
  const raw = getSettings()['digest_config'];
  try {
    const c = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return { on: !!c.enabled, channelId: String(c.channelId || '') };
  } catch {
    return { on: false, channelId: '' };
  }
}

type Row = { messages?: number; joins?: number; leaves?: number; voice_minutes?: number };

function weekTag(now: Date): string {
  const doy = Math.floor((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 1)) / 86_400_000);
  return `${now.getUTCFullYear()}-W${Math.floor(doy / 7)}`;
}

async function maybePost(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const c = cfg();
  if (!c.on || !c.channelId) return;
  const now = new Date();
  if (now.getUTCDay() !== 1) return; // tylko poniedziałek
  const tag = weekTag(now);
  if ((await cloudGetSetting('digest_last').catch(() => null)) === tag) return;

  const since = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const rows = await cloudSelect<Row>('activity_daily', `select=*&day=gte.${since}`).catch(
    () => [] as Row[],
  );
  const s = rows.reduce(
    (a, r) => ({
      m: a.m + (r.messages ?? 0),
      j: a.j + (r.joins ?? 0),
      l: a.l + (r.leaves ?? 0),
      v: a.v + (r.voice_minutes ?? 0),
    }),
    { m: 0, j: 0, l: 0, v: 0 },
  );
  const ch = await client.channels.fetch(c.channelId).catch(() => null);
  if (ch?.isTextBased() && 'send' in ch) {
    const net = s.j - s.l;
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle('📊 Tygodniowe podsumowanie serwera')
      .addFields(
        { name: '💬 Wiadomości', value: s.m.toLocaleString('pl-PL'), inline: true },
        { name: '🎙️ Minuty voice', value: s.v.toLocaleString('pl-PL'), inline: true },
        {
          name: '👥 Wzrost',
          value: `+${s.j} / -${s.l} (netto ${net >= 0 ? '+' : ''}${net})`,
          inline: true,
        },
      )
      .setTimestamp(now);
    await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
  }
  await cloudSetSetting('digest_last', tag).catch(() => {});
}

export function startDigest(client: Client): void {
  console.log('[digest] aktywny (tygodniowy, config z panelu).');
  void maybePost(client);
  setInterval(
    () => void maybePost(client).catch((e) => console.warn('[digest]', (e as Error).message)),
    6 * 3_600_000,
  );
}
