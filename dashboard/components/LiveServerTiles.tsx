'use client';

import { Hash, Radio, Rocket, Users, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import CountUp from './CountUp';

type Status = {
  online: boolean | null;
  guilds?: number | null;
  members?: number | null;
  voice?: number | null;
  boosts?: number | null;
  channels?: number | null;
};

const TILES = [
  { key: 'guilds', label: 'Serwery', icon: Radio },
  { key: 'members', label: 'Członkowie', icon: Users },
  { key: 'voice', label: 'Na voice (teraz)', icon: Volume2 },
  { key: 'boosts', label: 'Boosty', icon: Rocket },
  { key: 'channels', label: 'Kanały', icon: Hash },
] as const;

// Live-kafelki serwera — czyta /api/bot-status (heartbeat bota), odświeża co 12 s,
// pauzuje gdy karta w tle, animuje liczby (CountUp). Puls = świeże dane.
export default function LiveServerTiles() {
  const [s, setS] = useState<Status>({ online: null });
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetch('/api/bot-status')
        .then((r) => r.json())
        .then((d: Status) => {
          if (!alive) return;
          setS(d);
          setPulse(true);
          setTimeout(() => alive && setPulse(false), 700);
        })
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 12_000);
    const onVis = () => {
      if (!document.hidden) load();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const live = s.online === true;

  return (
    <section className="panel-glow relative overflow-hidden rounded-2xl border border-line bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${live ? 'bg-green-500 pulse-dot' : s.online === false ? 'bg-accent' : 'bg-muted'}`}
        />
        <h2 className="text-base font-semibold uppercase tracking-wide">Serwer na żywo</h2>
        <span className="text-xs text-muted">
          {live
            ? 'bot online · odświeża co 12 s'
            : s.online === false
              ? 'bot offline'
              : 'łączenie…'}
        </span>
        {pulse && live && (
          <span className="ml-auto text-[10px] uppercase tracking-wide text-green-500/80">
            ● aktualizacja
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TILES.map((t) => {
          const v = s[t.key];
          const Icon = t.icon;
          return (
            <div
              key={t.key}
              className="group rounded-xl border border-line bg-bg/40 p-3.5 transition-all hover:-translate-y-0.5 hover:border-accent/40"
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted">
                <span>{t.label}</span>
                <Icon size={14} className="text-accent/70 transition group-hover:text-accent" />
              </div>
              <div className="mt-1.5 font-display text-2xl font-bold">
                {typeof v === 'number' ? <CountUp value={v} /> : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
