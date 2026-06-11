'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';
import type { Game } from '../lib/types';
import Card from './Card';
import { useT } from './LangProvider';

export default function Row({ title, items }: { title: string; items: Game[] }) {
  const tt = useT();
  const [emblaRef, embla] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <section className="group/row relative py-3">
      <h2 className="mb-2 px-4 text-lg font-semibold text-white/90 md:px-12">{title}</h2>

      <div className="relative">
        {/* viewport */}
        <div className="overflow-hidden px-4 md:px-12" ref={emblaRef}>
          {/* py daje miejsce na powiększenie kafelka na hover */}
          <div className="flex gap-2 py-6">
            {items.map((g) => (
              <Card key={`${g.platform}-${g.platform_app_id}`} game={g} />
            ))}
          </div>
        </div>

        {/* strzałki */}
        <button
          type="button"
          onClick={prev}
          aria-label={tt('row.prev')}
          className="absolute left-0 top-1/2 z-20 hidden h-[60%] -translate-y-1/2 items-center justify-center bg-black/50 px-2 text-3xl text-white opacity-0 transition group-hover/row:opacity-100 hover:bg-black/80 md:flex"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={next}
          aria-label={tt('row.next')}
          className="absolute right-0 top-1/2 z-20 hidden h-[60%] -translate-y-1/2 items-center justify-center bg-black/50 px-2 text-3xl text-white opacity-0 transition group-hover/row:opacity-100 hover:bg-black/80 md:flex"
        >
          ›
        </button>
      </div>
    </section>
  );
}
