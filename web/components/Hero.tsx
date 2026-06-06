'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { proxied, steamHero } from '../lib/cover';
import type { Game } from '../lib/types';

function hours(min: number): string {
  const h = min / 60;
  return h >= 1 ? `${h.toFixed(0)} h` : `${min} min`;
}

export default function Hero({ game }: { game: Game }) {
  const [src, setSrc] = useState(steamHero(game));
  const headerFallback =
    game.platform === 'steam'
      ? proxied(
          `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.platform_app_id}/header.jpg`,
        )
      : game.cover_url
        ? proxied(game.cover_url)
        : '';

  return (
    <section className="relative h-[72vh] min-h-[480px] w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={game.title}
        className="absolute inset-0 h-full w-full object-cover object-top"
        onError={() => setSrc(headerFallback)}
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 max-w-2xl px-4 pt-36 md:px-12 md:pt-44"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-accent">
          Najczęściej grane
        </span>
        <h1 className="mt-2 text-4xl font-extrabold drop-shadow-lg md:text-6xl">{game.title}</h1>
        <p className="mt-3 text-sm text-white/80">
          {game.release_year ? `${game.release_year} · ` : ''}
          {game.genres.slice(0, 3).join(' · ')}
          {game.playtime_min ? ` · ${hours(game.playtime_min)} w grze` : ''}
        </p>
        {game.summary && (
          <p className="mt-3 line-clamp-3 max-w-xl text-sm text-white/70">{game.summary}</p>
        )}
        <div className="mt-6 flex gap-3">
          <a
            href={game.platform === 'steam' ? `steam://run/${game.platform_app_id}` : '#'}
            className="flex items-center gap-2 rounded bg-white px-7 py-2.5 font-semibold text-black transition hover:bg-white/85"
          >
            ▶ Graj
          </a>
          <button className="rounded bg-white/20 px-7 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/30">
            ℹ Więcej info
          </button>
        </div>
      </motion.div>
    </section>
  );
}
