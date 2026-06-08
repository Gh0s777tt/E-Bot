'use client';

// Faza 8 — szczegóły gry (modal): okładka, platforma, rok, gatunki, czas gry, ostatnio grane, opis
// + link do sklepu Steam (gdy to gra Steam). Dane ze stored 'games' (bez zewnętrznych API).
import { ExternalLink, X } from 'lucide-react';
import { useEffect } from 'react';
import type { Game } from '../lib/data';
import CoverImg from './CoverImg';

const PLATFORM_LABEL: Record<string, string> = {
  steam: 'Steam',
  psn: 'PlayStation',
  gog: 'GOG',
  ubisoft: 'Ubisoft',
};

export default function GameDetailModal({
  game,
  onClose,
}: {
  game: Game | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!game) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game, onClose]);

  if (!game) return null;
  const hours = game.playtime_min ? Math.round(game.playtime_min / 60) : 0;
  const steamUrl =
    game.platform === 'steam' && /^\d+$/.test(game.platform_app_id)
      ? `https://store.steampowered.com/app/${game.platform_app_id}`
      : '';
  const lastPlayed = game.last_played
    ? new Date(game.last_played * 1000).toLocaleDateString('pl-PL')
    : '';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md border border-line p-1 text-muted transition hover:border-accent hover:text-accent"
          aria-label="Zamknij"
        >
          <X size={16} />
        </button>
        <div className="flex gap-4">
          <div className="w-32 shrink-0 overflow-hidden rounded-lg bg-elevated">
            <div className="aspect-[2/3]">
              <CoverImg game={game} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="font-display text-2xl tracking-wide">{game.title}</h2>
            <div className="flex flex-wrap gap-2 text-xs text-muted">
              <span className="rounded bg-elevated px-2 py-0.5">
                {PLATFORM_LABEL[game.platform] ?? game.platform}
              </span>
              {game.release_year && (
                <span className="rounded bg-elevated px-2 py-0.5">{game.release_year}</span>
              )}
              {hours > 0 && <span className="rounded bg-elevated px-2 py-0.5">{hours} h</span>}
              {lastPlayed && (
                <span className="rounded bg-elevated px-2 py-0.5">ostatnio: {lastPlayed}</span>
              )}
            </div>
            {game.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {game.genres.map((x) => (
                  <span
                    key={x}
                    className="rounded-full border border-line px-2 py-0.5 text-xs text-muted"
                  >
                    {x}
                  </span>
                ))}
              </div>
            )}
            {steamUrl && (
              <a
                href={steamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-semibold transition hover:bg-accent-hover"
              >
                <ExternalLink size={14} /> Sklep Steam
              </a>
            )}
          </div>
        </div>
        {game.summary && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/80">
            {game.summary}
          </p>
        )}
      </div>
    </div>
  );
}
