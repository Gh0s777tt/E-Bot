'use client';

import { useState } from 'react';
import { coverFallbacks } from '../lib/cover';
import type { Game } from '../lib/types';

export default function CoverImg({ game, className }: { game: Game; className?: string }) {
  const srcs = coverFallbacks(game);
  const [i, setI] = useState(0);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={srcs[i]}
      alt={game.title}
      loading="lazy"
      className={className}
      onError={() => setI((p) => (p < srcs.length - 1 ? p + 1 : p))}
      draggable={false}
    />
  );
}
