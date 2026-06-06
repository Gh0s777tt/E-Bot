import type { Game } from '../lib/data';
import CoverImg from './CoverImg';

const PLATFORM_BADGE: Record<string, string> = {
  steam: 'Steam',
  psn: 'PS',
  gog: 'GOG',
  ubisoft: 'Ubi',
};

export default function GameCard({ game }: { game: Game }) {
  const hours = game.playtime_min ? Math.round(game.playtime_min / 60) : 0;
  return (
    <div className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-elevated shadow-lg transition hover:ring-2 hover:ring-accent">
      <CoverImg game={game} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
      <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        {PLATFORM_BADGE[game.platform] ?? game.platform}
      </span>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
        <p className="line-clamp-2 text-xs font-semibold leading-tight">{game.title}</p>
        <p className="mt-0.5 text-[10px] text-muted">
          {game.release_year ?? ''}
          {hours ? ` · ${hours} h` : ''}
        </p>
      </div>
    </div>
  );
}
