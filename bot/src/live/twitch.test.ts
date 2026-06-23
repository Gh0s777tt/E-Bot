// Rygiel parsera transmisji LIVE Twitch (parseTwitchLive) — wyłoniony behavior-preserving z
// getTwitchLive. Domyka czwórkę parserów live. KLUCZ: obecność `data[0]` decyduje LIVE; thumbnail z API
// ma placeholdery `{width}`/`{height}`, które MUSZĄ zostać podmienione na 1280×720 (inaczej URL miniatury
// = 404); channelName `user_name ?? login`. Regresja = zepsuta miniatura albo zła nazwa kanału.
import { describe, expect, it } from 'vitest';
import { parseTwitchLive } from './twitch.mts';

describe('parseTwitchLive — odpowiedź Twitch helix/streams → LiveStatus', () => {
  it('brak data → NIE live (channelName z login)', () => {
    expect(parseTwitchLive({ data: [] }, 'ghost')).toEqual({
      platform: 'twitch',
      live: false,
      channelName: 'ghost',
    });
  });

  it('fail-safe: garbage → live:false, bez wyjątku', () => {
    for (const g of [null, undefined, 'x', 42, {}, { data: [null] }]) {
      expect(parseTwitchLive(g as unknown, 'ghost')).toMatchObject({ platform: 'twitch' });
    }
  });

  it('RYGIEL placeholderów miniatury: {width}/{height} → 1280×720', () => {
    const out = parseTwitchLive(
      { data: [{ thumbnail_url: 'https://img/{width}x{height}.jpg' }] },
      'ghost',
    );
    expect(out.thumbnail).toBe('https://img/1280x720.jpg');
    expect(out.thumbnail).not.toContain('{');
  });

  it('RYGIEL channelName: user_name z API ma pierwszeństwo, fallback na login', () => {
    expect(parseTwitchLive({ data: [{ user_name: 'Gh0st' }] }, 'ghost').channelName).toBe('Gh0st');
    expect(parseTwitchLive({ data: [{ title: 't' }] }, 'ghost').channelName).toBe('ghost');
  });

  it('mapuje tytuł/grę/widzów/URL', () => {
    const out = parseTwitchLive(
      { data: [{ title: 'Gramy', game_name: 'Elden Ring', viewer_count: 42 }] },
      'ghost',
    );
    expect(out).toMatchObject({
      live: true,
      title: 'Gramy',
      game: 'Elden Ring',
      viewers: 42,
      url: 'https://twitch.tv/ghost',
    });
  });
});
