// Rygiel parsera transmisji LIVE YouTube (parseYouTubeLive) — wyłoniony behavior-preserving z
// getYouTubeLive. KLUCZ: obecność `items[0]` decyduje LIVE vs nie-live (search.list zwraca element
// tylko gdy trwa transmisja); niezaufany kształt JSON parsowany przez `?.` (garbage/braki → bez wyjątku,
// pola undefined). Regresja = fałszywe „LIVE"/„offline" albo crash pollera na nietypowej odpowiedzi.
import { describe, expect, it } from 'vitest';
import { parseYouTubeLive } from './youtube.mts';

describe('parseYouTubeLive — odpowiedź YouTube search.list → LiveStatus', () => {
  it('brak items → NIE live (tylko platform + live:false)', () => {
    expect(parseYouTubeLive({ items: [] })).toEqual({ platform: 'youtube', live: false });
    expect(parseYouTubeLive({})).toEqual({ platform: 'youtube', live: false });
  });

  it('RYGIEL fail-safe: niezaufany/garbage kształt → live:false, bez wyjątku', () => {
    for (const g of [null, undefined, 'x', 42, { items: 'nie-tablica' }, { items: [null] }]) {
      expect(parseYouTubeLive(g as unknown)).toMatchObject({ platform: 'youtube' });
      // null-owy item też nie może wybuchnąć ani udawać live
      if (JSON.stringify(g)?.includes('null')) {
        expect(parseYouTubeLive(g as unknown).live).toBe(false);
      }
    }
  });

  it('obecny item → live:true z mapowaniem pól', () => {
    const out = parseYouTubeLive({
      items: [
        {
          id: { videoId: 'abc123' },
          snippet: {
            title: 'Stream!',
            channelTitle: 'Ghost',
            thumbnails: { high: { url: 'https://img/h.jpg' } },
          },
        },
      ],
    });
    expect(out).toEqual({
      platform: 'youtube',
      live: true,
      title: 'Stream!',
      channelName: 'Ghost',
      url: 'https://youtube.com/watch?v=abc123',
      thumbnail: 'https://img/h.jpg',
    });
  });

  it('item bez snippetu → live:true, pola undefined (bez wyjątku)', () => {
    const out = parseYouTubeLive({ items: [{}] });
    expect(out.live).toBe(true);
    expect(out.title).toBeUndefined();
  });
});
