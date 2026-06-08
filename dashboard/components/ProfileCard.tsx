import { BADGE_COUNT, resolveBadges } from '../lib/badges';
import { relTime } from '../lib/insights';
import type { ProfileCardData } from '../lib/public';

const TX_LABEL: Record<string, string> = {
  daily: '💸 Dzienna',
  praca: '💼 Praca',
  rabunek: '🦹 Rabunek',
  okradziono: '😱 Okradziono',
  mandat: '🚓 Mandat',
  przelew: '🤝 Przelew',
  gamble: '🎲 Zakład',
  slots: '🎰 Sloty',
  sklep: '🛒 Sklep',
  lootbox: '🎁 Lootbox',
  ruletka: '🎡 Ruletka',
};

// Karta profilu w dashboardzie — odpowiednik karty z serwera, wzbogacona o ekonomię i aktywność.
export default function ProfileCard({
  data,
  avatar,
  uname,
}: {
  data: ProfileCardData;
  avatar?: string;
  uname: string;
}) {
  const pct = data.forLevel ? Math.min(100, Math.round((data.inLevel / data.forLevel) * 100)) : 0;
  const vh = Math.floor(data.voiceMin / 60);
  const vm = data.voiceMin % 60;
  const netWorth = data.wallet + data.bank;
  const earned = resolveBadges(data.badgeIds);
  const now = Date.now();
  const tiles: { label: string; value: string | number }[] = [
    { label: 'Wiadomości', value: data.messages.toLocaleString('pl-PL') },
    { label: 'Czas na voice', value: vh ? `${vh}h ${vm}m` : `${vm}m` },
    { label: 'Portfel', value: data.wallet.toLocaleString('pl-PL') },
    { label: 'Bank', value: data.bank.toLocaleString('pl-PL') },
    { label: 'Majątek', value: netWorth.toLocaleString('pl-PL') },
    { label: '🔥 Streak', value: data.dailyStreak ? `${data.dailyStreak} dni` : '—' },
    { label: '🎒 Przedmioty', value: data.items },
    { label: 'Zaproszenia', value: data.invites },
  ];

  return (
    <div className="panel-glow relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-card to-bg p-5">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.18), transparent 70%)',
        }}
      />
      <div className="relative flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-20 w-20 rounded-2xl border-2 border-accent object-cover shadow-glow"
          />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-2xl border-2 border-accent bg-bg font-display text-3xl text-accent">
            {uname.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-display text-2xl tracking-wide">{uname}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md bg-accent/15 px-2 py-0.5 font-semibold text-accent">
              Poziom {data.level}
            </span>
            {data.rank > 0 && (
              <span className="rounded-md border border-line px-2 py-0.5 text-muted">
                #{data.rank} w rankingu XP
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="flex justify-between text-[11px] text-muted">
          <span>Postęp poziomu</span>
          <span>
            {data.inLevel.toLocaleString('pl-PL')} / {data.forLevel.toLocaleString('pl-PL')} XP
          </span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-dark transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-line bg-bg/40 p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted">{t.label}</div>
            <div className="mt-0.5 font-display text-lg font-bold">{t.value}</div>
          </div>
        ))}
      </div>

      <div className="relative mt-4">
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-muted">
          <span>Odznaki</span>
          <span className="font-semibold text-accent">
            {data.badges}/{BADGE_COUNT}
          </span>
        </div>
        {earned.length ? (
          <div className="flex flex-wrap gap-1.5">
            {earned.map((b) => (
              <span
                key={b.id}
                title={b.name}
                className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-white/90 transition hover:border-accent/60 hover:bg-accent/20"
              >
                <span className="text-sm leading-none">{b.emoji}</span>
                <span className="truncate">{b.name.split(' — ')[0]}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">
            Brak odznak — zdobywaj poziomy, ekonomię i zapraszaj znajomych, a pojawią się tutaj.
          </p>
        )}
      </div>

      {data.history.length > 0 && (
        <div className="relative mt-4">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">
            Historia ekonomii
          </div>
          <ul className="space-y-1">
            {data.history.map((h) => (
              <li key={`${h.ts}-${h.reason}`} className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{TX_LABEL[h.reason] ?? h.reason}</span>
                <span className="shrink-0 text-[11px] text-muted">{relTime(h.ts, now)}</span>
                <span
                  className={`w-24 shrink-0 text-right font-semibold tabular-nums ${h.delta >= 0 ? 'text-green-400' : 'text-accent'}`}
                >
                  {h.delta >= 0 ? '+' : ''}
                  {h.delta.toLocaleString('pl-PL')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!data.found && (
        <p className="relative mt-3 text-xs text-muted">
          Brak danych — napisz coś na serwerze albo użyj ekonomii/leveli, a karta się wypełni.
        </p>
      )}
    </div>
  );
}
