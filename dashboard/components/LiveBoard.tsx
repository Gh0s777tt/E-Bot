'use client';

import { useEffect, useRef, useState } from 'react';

type Live = {
  platform: string;
  label: string;
  channel: string;
  color: string;
  configured: boolean;
  live: boolean;
  title?: string;
  game?: string;
  viewers?: number;
  url?: string;
  thumbnail?: string;
};

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.06;
    o.start();
    o.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
    o.stop(ctx.currentTime + 0.25);
  } catch {
    /* audio zablokowane */
  }
}

export default function LiveBoard({ initial }: { initial: Live[] }) {
  const [statuses, setStatuses] = useState<Live[]>(initial);
  const [updatedAt, setUpdatedAt] = useState('');
  const prevLive = useRef(new Set(initial.filter((s) => s.live).map((s) => s.platform)));

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch('/api/live', { cache: 'no-store' });
        if (!r.ok) return;
        const data = (await r.json()) as Live[];
        if (!alive) return;
        const nowLive = new Set(data.filter((s) => s.live).map((s) => s.platform));
        const newly = [...nowLive].filter((p) => !prevLive.current.has(p));
        if (newly.length) {
          beep();
          const names = data.filter((s) => newly.includes(s.platform)).map((s) => s.label).join(', ');
          document.title = `🔴 LIVE: ${names}`;
        } else if (nowLive.size === 0) {
          document.title = 'Na żywo — E-Bot';
        }
        prevLive.current = nowLive;
        setStatuses(data);
        setUpdatedAt(new Date().toLocaleTimeString('pl-PL'));
      } catch {
        /* ignore */
      }
    };
    const id = setInterval(tick, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const liveNow = statuses.filter((s) => s.live);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {liveNow.length ? (
            <span className="inline-flex items-center gap-2 font-semibold text-accent">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
              {liveNow.length} na żywo teraz
            </span>
          ) : (
            'Nikt nie streamuje w tej chwili.'
          )}
        </p>
        <span className="text-[11px] uppercase tracking-wide text-muted/60">
          {updatedAt ? `aktualizacja ${updatedAt}` : 'auto-odświeżanie co 30 s'}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {statuses.map((s) => (
          <div
            key={s.platform}
            className={`panel-glow overflow-hidden rounded-2xl border bg-card transition ${s.live ? 'border-accent/50' : 'border-line'}`}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="flex items-center gap-2 font-display text-base uppercase tracking-wide">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
                {s.channel ? <span className="text-xs lowercase text-muted">@{s.channel}</span> : null}
              </span>
              {!s.configured ? (
                <span className="text-[11px] uppercase tracking-wide text-muted">nieskonfigurowane</span>
              ) : s.live ? (
                <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">● Na żywo</span>
              ) : (
                <span className="text-[11px] uppercase tracking-wide text-muted">offline</span>
              )}
            </div>

            {s.live && (
              <a href={s.url} target="_blank" rel="noreferrer" className="block transition hover:opacity-90">
                {s.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.thumbnail} alt="" className="aspect-video w-full border-y border-line object-cover" />
                )}
                <div className="px-5 py-3">
                  <p className="line-clamp-1 text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted">
                    {[s.game, s.viewers != null ? `${s.viewers} widzów` : null].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
