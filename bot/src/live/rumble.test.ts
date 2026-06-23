// Rygiel parsera transmisji LIVE Rumble (parseRumbleLive) — wyłoniony behavior-preserving z
// getRumbleLive. KLUCZ: obecność `livestreams[0]` decyduje LIVE; fallbacki na niespójny kształt API —
// widzowie `watching_now ?? viewers`, URL bezpośredni LUB zbudowany z względnego `link`, thumbnail jako
// STRING albo obiekt `{url}`. Regresja = brak widzów/linku/miniatury albo crash pollera na garbage.
import { describe, expect, it } from 'vitest';
import { parseRumbleLive } from './rumble.mts';

describe('parseRumbleLive — odpowiedź Rumble → LiveStatus', () => {
  it('brak livestreams → NIE live (channelName z username zostaje)', () => {
    expect(parseRumbleLive({ username: 'Ghost', livestreams: [] })).toEqual({
      platform: 'rumble',
      live: false,
      channelName: 'Ghost',
    });
  });

  it('fail-safe: garbage → live:false, bez wyjątku', () => {
    for (const g of [null, undefined, 'x', 42, {}]) {
      expect(parseRumbleLive(g as unknown)).toMatchObject({ platform: 'rumble', live: false });
    }
  });

  it('RYGIEL widzów: watching_now ma pierwszeństwo, ale fallback na viewers', () => {
    expect(parseRumbleLive({ livestreams: [{ watching_now: 50, viewers: 9 }] }).viewers).toBe(50);
    expect(parseRumbleLive({ livestreams: [{ viewers: 9 }] }).viewers).toBe(9);
  });

  it('RYGIEL URL: bezpośredni url wygrywa; inaczej budowany z względnego link', () => {
    expect(parseRumbleLive({ livestreams: [{ url: 'https://x/abs' }] }).url).toBe('https://x/abs');
    expect(parseRumbleLive({ livestreams: [{ link: '/c/strumień' }] }).url).toBe(
      'https://rumble.com/c/strumień',
    );
    expect(parseRumbleLive({ livestreams: [{ title: 't' }] }).url).toBeUndefined();
  });

  it('RYGIEL thumbnail: string wprost, obiekt → .url', () => {
    expect(parseRumbleLive({ livestreams: [{ thumbnail: 'https://img/s.jpg' }] }).thumbnail).toBe(
      'https://img/s.jpg',
    );
    expect(
      parseRumbleLive({ livestreams: [{ thumbnail: { url: 'https://img/o.jpg' } }] }).thumbnail,
    ).toBe('https://img/o.jpg');
  });
});
