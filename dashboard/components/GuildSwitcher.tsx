'use client';

// Etap K — przełącznik serwerów. Pokazuje się tylko gdy bot jest na >1 serwerze. Wybór zapisujemy
// w cookie 'panel_guild' i odświeżamy router (SSR czyta cookie → cały panel przełącza kontekst,
// bez twardego reloadu/flasha — wzorzec jak w LangContext).
import { ChevronDown, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

type BotGuild = { id: string; name: string; icon: string | null };

export default function GuildSwitcher() {
  const { lang } = useLang();
  const router = useRouter();
  const [guilds, setGuilds] = useState<BotGuild[]>([]);
  const [current, setCurrent] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/guilds')
      .then((r) => r.json())
      .then((j: { guilds?: BotGuild[]; current?: string }) => {
        setGuilds(j.guilds ?? []);
        setCurrent(j.current ?? '');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Jeden serwer (lub brak) → nie ma czego przełączać.
  if (guilds.length <= 1) return null;

  const active = guilds.find((g) => g.id === current) ?? guilds[0];

  function pick(id: string): void {
    if (id === current) {
      setOpen(false);
      return;
    }
    try {
      // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API nie działa w Firefox/Safari; prosty zapis wystarcza
      document.cookie = `panel_guild=${id}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* brak cookies */
    }
    setCurrent(id); // optymistycznie: aktywny serwer od razu (bez czekania na re-fetch)
    setOpen(false);
    router.refresh(); // SSR odczyta nowy serwer z cookie i przerysuje panel — bez twardego reloadu
  }

  const icon = (g: BotGuild) =>
    g.icon ? (
      <img
        src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=32`}
        alt=""
        className="h-5 w-5 rounded-full"
      />
    ) : (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-elevated text-[10px] text-muted">
        {g.name.slice(0, 1).toUpperCase()}
      </span>
    );

  return (
    <div ref={ref} data-tour="guild" className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={tp(lang, 'ui.server')}
        className="flex max-w-[180px] items-center gap-1.5 rounded-md border border-line px-2 py-1 text-xs transition hover:border-accent"
      >
        <Server size={13} className="shrink-0 text-accent" />
        <span className="truncate font-semibold">{active?.name ?? '—'}</span>
        <ChevronDown size={12} className="shrink-0 text-muted" />
      </button>
      {open && (
        <div className="absolute start-0 z-50 mt-1 max-h-72 w-60 overflow-auto rounded-lg border border-line bg-card p-1 shadow-2xl">
          <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted">
            {tp(lang, 'ui.server')}
          </p>
          {guilds.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => pick(g.id)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm transition ${
                g.id === current ? 'bg-elevated text-white' : 'text-white/80 hover:bg-elevated'
              }`}
            >
              {icon(g)}
              <span className="flex-1 truncate">{g.name}</span>
              {g.id === current && <span className="text-xs text-accent">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
