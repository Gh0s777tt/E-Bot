'use client';

import { useState } from 'react';
import type { Game } from '../lib/data';
import { coverFallbacks } from '../lib/cover';

export default function CoverImg({ game, className }: { game: Game; className?: string }) {
  const srcs = coverFallbacks(game);
  const [i, setI] = useState(0);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={srcs[i]}
      alt={game.title}
      loading="lazy"
      draggable={false}
      className={className}
      onError={() => setI((p) => (p < srcs.length - 1 ? p + 1 : p))}
    />
  );
}
