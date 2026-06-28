// Tor E — tygodniowy auto-digest serwera (poniedziałek UTC). Sumuje activity_daily z 7 dni
// i wysyła embed na wybrany kanał. Dedup przez setting 'digest_last' (tag tygodnia).

import { type Client, EmbedBuilder, type TextChannel } from 'discord.js';
import { listClans, sortClansByBank } from '../economy/clans.mts';
import { cloudGetSetting, cloudSelect, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { weekKey } from '../lib/weekKey.mts';

type Cfg = { on: boolean; channelId: string };
// Etap K — config per-serwer: świeży odczyt (poller tygodniowy), fallback global.
function cfg(guildId: string): Cfg {
  const raw = getGuildSettings(guildId)['digest_config'];
  try {
    const c = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return { on: !!c.enabled, channelId: String(c.channelId || '') };
  } catch {
    return { on: false, channelId: '' };
  }
}

type Row = { messages?: number; joins?: number; leaves?: number; voice_minutes?: number };

type UserActivityRow = { user_id: string; username?: string; messages?: number; day?: string };

// 🏆 „Najaktywniejszy" tygodnia: grupuje wiersze user_activity po user_id, SUMUJE wiadomości z dni,
// rozwiązuje nazwę (username z dowolnego wiersza > fallback user_id) i zwraca lidera (sort malejąco).
export function topUserByMessages(
  rows: UserActivityRow[],
): { name: string; msgs: number } | undefined {
  const byUser = new Map<string, { name: string; msgs: number }>();
  for (const r of rows) {
    const cu = byUser.get(r.user_id) ?? { name: r.username || r.user_id, msgs: 0 };
    cu.msgs += r.messages ?? 0;
    if (r.username) cu.name = r.username;
    byUser.set(r.user_id, cu);
  }
  return [...byUser.values()].sort((a, b) => b.msgs - a.msgs)[0];
}

// 🧊 Stygnący członkowie (churn-risk, czysta funkcja): aktywni w PIERWSZEJ części okna (dzień < splitDay),
// ucichli w DRUGIEJ (0 wiadomości od splitDay). Wczesny sygnał odejścia — mod może odezwać się zanim
// znikną. Sort malejąco po wcześniejszych wiadomościach (najwięksi „byli aktywni" pierwsi). Wiersz bez
// `day` lub z dnia ≥ splitDay liczy się jako „później" (konserwatywnie — nie fałszuje stygnięcia).
export function coolingMembers(
  rows: { user_id: string; username?: string; messages?: number; day?: string }[],
  splitDay: string,
): { name: string; before: number }[] {
  const agg = new Map<string, { name: string; before: number; after: number }>();
  for (const r of rows) {
    const cur = agg.get(r.user_id) ?? { name: r.username || r.user_id, before: 0, after: 0 };
    if (r.day && r.day < splitDay) cur.before += r.messages ?? 0;
    else cur.after += r.messages ?? 0;
    if (r.username) cur.name = r.username;
    agg.set(r.user_id, cur);
  }
  return [...agg.values()]
    .filter((u) => u.before > 0 && u.after === 0)
    .sort((a, b) => b.before - a.before)
    .map((u) => ({ name: u.name, before: u.before }));
}

// 📥 Lejek nowych członków (czysta funkcja): z dołączeń w oknie liczy aktywację (napisali ≥1 wiadomość →
// są w zbiorze aktywnych) i retencję (zostali → brak `left_at`). Pokazuje, gdzie tracimy nowych:
// dołączyli, ale nie odezwali się / od razu wyszli. `joiners` = wiersze member_cohorts z okna.
export function memberFunnel(
  joiners: { user_id: string; left_at?: string | null }[],
  activeUserIds: Set<string>,
): { joined: number; activated: number; retained: number } {
  let activated = 0;
  let retained = 0;
  for (const j of joiners) {
    if (activeUserIds.has(j.user_id)) activated++;
    if (!j.left_at) retained++;
  }
  return { joined: joiners.length, activated, retained };
}

// 📈 Benchmark okres-do-okresu (czysta funkcja): porównuje bieżącą wartość z poprzednim oknem. Zwraca
// Δ, % zmiany (null gdy poprzednio 0 — brak bazy do procentu) i strzałkę. Pozwala digestowi pokazać
// TREND (rośnie/maleje serwer tydzień do tygodnia), nie tylko surową liczbę.
export type Trend = { delta: number; pct: number | null; arrow: '▲' | '▼' | '▬' };

export function trend(current: number, previous: number): Trend {
  const delta = current - previous;
  const pct = previous > 0 ? Math.round((delta / previous) * 100) : null;
  const arrow: Trend['arrow'] = delta > 0 ? '▲' : delta < 0 ? '▼' : '▬';
  return { delta, pct, arrow };
}

// Etykieta trendu do embeda: „▲ +15%" / „▼ -8%" / „▬ 0%". Bez bazy (poprzednio 0): „🆕 +N" przy
// przyroście, „▬" gdy oba okna zerowe.
export function trendLabel(t: Trend): string {
  if (t.pct === null) return t.delta > 0 ? `🆕 +${t.delta.toLocaleString('pl-PL')}` : '▬';
  return `${t.arrow} ${t.pct > 0 ? '+' : ''}${t.pct}%`;
}

// 📈 „Największy skok aktywności" (czysta): per-user różnica wiadomości między oknem BIEŻĄCYM a POPRZEDNIM.
// Wyłania największy DODATNI przyrost (≥ minDelta, by odfiltrować szum). Docenia ROSNĄCYCH członków, nie
// tylko stałych liderów (uzupełnienie topUserByMessages). undefined, gdy nikt znacząco nie urósł.
export function mostImproved(
  current: UserActivityRow[],
  previous: UserActivityRow[],
  minDelta = 20,
): { name: string; before: number; after: number; delta: number } | undefined {
  const agg = new Map<string, { name: string; before: number; after: number }>();
  const fold = (rows: UserActivityRow[], key: 'before' | 'after') => {
    for (const r of rows) {
      const cur = agg.get(r.user_id) ?? { name: r.username || r.user_id, before: 0, after: 0 };
      cur[key] += r.messages ?? 0;
      if (r.username) cur.name = r.username;
      agg.set(r.user_id, cur);
    }
  };
  fold(previous, 'before');
  fold(current, 'after');
  let best: { name: string; before: number; after: number; delta: number } | undefined;
  for (const u of agg.values()) {
    const delta = u.after - u.before;
    if (delta >= minDelta && (!best || delta > best.delta)) {
      best = { name: u.name, before: u.before, after: u.after, delta };
    }
  }
  return best;
}

// 📊 Benchmark cross-server (czysta): percentyl wartości w zbiorze = % wartości MNIEJSZYCH niż `value`
// (0–100). „Twój serwer aktywniejszy niż X% serwerów obsługiwanych przez bota". Zbiór ≤ 1 elementu →
// 100 (brak próbki do porównania → szczyt własnej). Anonimowe: serwer widzi tylko WŁASNĄ pozycję.
export function percentileRank(value: number, all: number[]): number {
  if (all.length <= 1) return 100;
  const below = all.filter((v) => v < value).length;
  return Math.round((below / all.length) * 100);
}

async function maybePost(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const now = new Date();
  if (now.getUTCDay() !== 1) return; // tylko poniedziałek
  const tag = weekKey(now);
  const since = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);

  // ⭐ Reputacja jest GLOBALNA (feature /rep, klucz 'reputation' bot-wide) — wspólna dla wszystkich.
  let topRep: { name: string; points: number } | null = null;
  try {
    const raw = await cloudGetSetting('reputation');
    if (raw) {
      const map = JSON.parse(raw) as Record<string, { points: number; name: string }>;
      const best = Object.values(map).sort((a, b) => b.points - a.points)[0];
      if (best && best.points > 0) topRep = best;
    }
  } catch {
    /* brak repów */
  }

  // 📊 Benchmark cross-server: tygodniowa suma wiadomości KAŻDEGO serwera (jedno zapytanie) → próbka do
  // percentyla. Każdy serwer zobaczy tylko WŁASNĄ pozycję względem reszty (anonimowo, bez danych innych).
  const benchRows = await cloudSelect<{ guild_id: string; messages?: number }>(
    'activity_daily',
    `select=guild_id,messages&day=gte.${since}`,
  ).catch(() => [] as { guild_id: string; messages?: number }[]);
  const benchTotals = new Map<string, number>();
  for (const r of benchRows)
    benchTotals.set(r.guild_id, (benchTotals.get(r.guild_id) ?? 0) + (r.messages ?? 0));
  const benchSample = [...benchTotals.values()];

  // Etap K — digest PER-SERWER: iterujemy serwery, sumujemy activity_daily/user_activity danego
  // serwera (oba mają guild_id), dedup per-serwer (digest_last:<guildId>).
  for (const guild of client.guilds.cache.values()) {
    const c = cfg(guild.id);
    if (!c.on || !c.channelId) continue;
    const dedupKey = `digest_last:${guild.id}`;
    if ((await cloudGetSetting(dedupKey).catch(() => null)) === tag) continue;

    const rows = await cloudSelect<Row>(
      'activity_daily',
      `select=*&guild_id=eq.${guild.id}&day=gte.${since}`,
    ).catch(() => [] as Row[]);
    const s = rows.reduce(
      (a, r) => ({
        m: a.m + (r.messages ?? 0),
        j: a.j + (r.joins ?? 0),
        l: a.l + (r.leaves ?? 0),
        v: a.v + (r.voice_minutes ?? 0),
      }),
      { m: 0, j: 0, l: 0, v: 0 },
    );
    // 📈 Benchmark: poprzednie 7 dni (dzień ∈ [−14, −7)) do trendu tydzień-do-tygodnia.
    const since14 = new Date(now.getTime() - 14 * 86_400_000).toISOString().slice(0, 10);
    const prevRows = await cloudSelect<Row>(
      'activity_daily',
      `select=messages,voice_minutes&guild_id=eq.${guild.id}&day=gte.${since14}&day=lt.${since}`,
    ).catch(() => [] as Row[]);
    const p = prevRows.reduce(
      (a, r) => ({ m: a.m + (r.messages ?? 0), v: a.v + (r.voice_minutes ?? 0) }),
      { m: 0, v: 0 },
    );
    // 🏆 Najaktywniejszy (per-user, 7 dni) danego serwera.
    const ua = await cloudSelect<UserActivityRow>(
      'user_activity',
      `select=user_id,username,messages,day&guild_id=eq.${guild.id}&day=gte.${since}`,
    ).catch(() => [] as UserActivityRow[]);
    const topUser = topUserByMessages(ua);
    // 🧊 Stygnący: aktywni w 1. połowie okna, cisza w ostatnich 3 dniach (wczesny churn-risk).
    const splitDay = new Date(now.getTime() - 3 * 86_400_000).toISOString().slice(0, 10);
    const cooling = coolingMembers(ua, splitDay);
    // 📈 Największy skok aktywności: per-user przyrost vs poprzednie 7 dni (user_activity z [−14, −7)).
    const prevUa = await cloudSelect<UserActivityRow>(
      'user_activity',
      `select=user_id,username,messages,day&guild_id=eq.${guild.id}&day=gte.${since14}&day=lt.${since}`,
    ).catch(() => [] as UserActivityRow[]);
    const improved = mostImproved(ua, prevUa);
    // 📥 Lejek nowych: dołączenia z okna (member_cohorts) → ilu napisało → ilu zostało.
    const joiners = await cloudSelect<{ user_id: string; left_at?: string | null }>(
      'member_cohorts',
      `select=user_id,left_at&guild_id=eq.${guild.id}&joined_at=gte.${since}`,
    ).catch(() => [] as { user_id: string; left_at?: string | null }[]);
    const funnel = memberFunnel(joiners, new Set(ua.map((r) => r.user_id)));
    // 🏆 Klan tygodnia: najbogatszy klan serwera wg wspólnego banku (kosmetyczne wyróżnienie, bez nagród
    // → brak abuse'u). Reużywa otestowanej `sortClansByBank`.
    const topClan = sortClansByBank(await listClans(guild.id))[0];

    const ch = await client.channels.fetch(c.channelId).catch(() => null);
    // Kanał musi należeć do TEGO serwera (config mógł zostać po przeniesieniu/zmianie).
    if (ch?.isTextBased() && 'send' in ch && 'guildId' in ch && ch.guildId === guild.id) {
      const net = s.j - s.l;
      const embed = new EmbedBuilder()
        .setColor(0xe50914)
        .setTitle('📊 Tygodniowe podsumowanie serwera')
        .addFields(
          {
            name: '💬 Wiadomości',
            value: `${s.m.toLocaleString('pl-PL')}  ${trendLabel(trend(s.m, p.m))}`,
            inline: true,
          },
          {
            name: '🎙️ Minuty voice',
            value: `${s.v.toLocaleString('pl-PL')}  ${trendLabel(trend(s.v, p.v))}`,
            inline: true,
          },
          {
            name: '👥 Wzrost',
            value: `+${s.j} / -${s.l} (netto ${net >= 0 ? '+' : ''}${net})`,
            inline: true,
          },
        )
        .setTimestamp(now);
      if (topUser && topUser.msgs > 0)
        embed.addFields({
          name: '🏆 Najaktywniejszy',
          value: `${topUser.name} — ${topUser.msgs.toLocaleString('pl-PL')} wiad.`,
          inline: false,
        });
      if (improved)
        embed.addFields({
          name: '📈 Największy skok aktywności',
          value: `${improved.name} — ${improved.before} → ${improved.after} wiad. (+${improved.delta})`,
          inline: false,
        });
      if (cooling.length)
        embed.addFields({
          name: '🧊 Stygnący (ucichli w tym tygodniu)',
          value: cooling
            .slice(0, 5)
            .map((u) => `${u.name} (${u.before} wiad. wcześniej)`)
            .join('\n'),
          inline: false,
        });
      if (funnel.joined > 0)
        embed.addFields({
          name: '📥 Lejek nowych (7 dni)',
          value: `Dołączyli: **${funnel.joined}** → napisali: **${funnel.activated}** → zostali: **${funnel.retained}**`,
          inline: false,
        });
      if (topRep)
        embed.addFields({
          name: '⭐ Najwyższa reputacja',
          value: `${topRep.name} — ${topRep.points} ⭐`,
          inline: false,
        });
      if (topClan && topClan.bank > 0)
        embed.addFields({
          name: '🏆 Klan tygodnia',
          value: `🛡️ **${topClan.name}** — 🏦 ${topClan.bank.toLocaleString('pl-PL')}`,
          inline: false,
        });
      // 📊 Benchmark: pozycja serwera względem innych obsługiwanych przez bota (≥ 3 serwery dla sensu).
      if (benchSample.length >= 3)
        embed.addFields({
          name: '📊 Pozycja serwera',
          value: `Aktywniejszy niż **${percentileRank(s.m, benchSample)}%** serwerów obsługiwanych przez bota`,
          inline: false,
        });
      await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
    }
    await cloudSetSetting(dedupKey, tag).catch(() => {});
  }
}

export function startDigest(client: Client): void {
  log.info('[digest] aktywny (tygodniowy, config z panelu).');
  void maybePost(client);
  setInterval(
    () => void maybePost(client).catch((e) => log.warn('[digest]', { err: e })),
    6 * 3_600_000,
  );
}
