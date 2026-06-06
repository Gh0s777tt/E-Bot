'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Game } from '../lib/types';
import CoverImg from './CoverImg';

function hours(min: number): string {
  const h = min / 60;
  return h >= 1 ? `${h.toFixed(0)} h` : `${min} min`;
}

function Modal({ game, onClose }: { game: Game; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-elevated shadow-2xl"
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 w-full">
          <CoverImg game={game} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-elevated via-elevated/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-accent"
            aria-label="Zamknij"
          >
            ✕
          </button>
          <h2 className="absolute bottom-3 left-5 right-5 text-3xl font-extrabold drop-shadow">{game.title}</h2>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {game.release_year && <span>{game.release_year}</span>}
            <span className="rounded bg-white/10 px-2 py-0.5 capitalize">{game.platform}</span>
            <span>{hours(game.playtime_min)} w grze</span>
          </div>
          {game.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {game.genres.map((g) => (
                <span key={g} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80">
                  {g}
                </span>
              ))}
            </div>
          )}
          {game.summary && <p className="text-sm leading-relaxed text-white/80">{game.summary}</p>}
          <div className="flex gap-3 pt-1">
            <a
              href={game.platform === 'steam' ? `steam://run/${game.platform_app_id}` : '#'}
              className="flex items-center gap-2 rounded bg-white px-6 py-2 font-semibold text-black transition hover:bg-white/85"
            >
              ▶ Graj
            </a>
            <a
              href={game.platform === 'steam' ? `https://store.steampowered.com/app/${game.platform_app_id}` : '#'}
              target="_blank"
              rel="noreferrer"
              className="rounded bg-white/15 px-6 py-2 font-semibold text-white transition hover:bg-white/25"
            >
              Sklep
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Card({ game }: { game: Game }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.1, zIndex: 30 }}
        transition={{ duration: 0.2 }}
        className="group relative aspect-[2/3] w-[130px] shrink-0 overflow-hidden rounded-md bg-elevated shadow-lg md:w-[165px]"
      >
        <CoverImg game={game} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/20 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <p className="line-clamp-2 text-xs font-semibold leading-tight">{game.title}</p>
          <p className="mt-0.5 text-[10px] text-muted">
            {game.release_year ?? ''}
            {game.playtime_min ? ` · ${hours(game.playtime_min)}` : ''}
          </p>
        </div>
      </motion.button>

      <AnimatePresence>{open && <Modal game={game} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
