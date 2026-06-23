// Rygiel parsera transmisji LIVE Kick (parseKickLive) — wyłoniony behavior-preserving z getKickLive.
// KLUCZ: kanał Kick istnieje zawsze, więc o LIVE decyduje WYŁĄCZNIE `stream.is_live` (nie sama obecność
// kanału) — inaczej bot ogłasza „LIVE" dla offline'owego streamera; channelName=slug zostaje też offline;
// niezaufany JSON parsowany przez `?.` (bez wyjątku); puste game/thumbnail → undefined.
import { describe, expect, it } from 'vitest';
import { parseKickLive } from './kick.mts';

describe('parseKickLive — odpowiedź Kick channels → LiveStatus', () => {
  it('RYGIEL is_live: kanał istnieje ale offline → live:false (channelName zostaje)', () => {
    const out = parseKickLive(
      { data: [{ stream: { is_live: false }, stream_title: 'x' }] },
      'ghost',
    );
    expect(out).toEqual({ platform: 'kick', live: false, channelName: 'ghost' });
  });

  it('RYGIEL fail-safe: brak data / garbage → live:false, bez wyjątku', () => {
    for (const g of [null, undefined, 'x', 42, {}, { data: [] }, { data: [null] }]) {
      expect(parseKickLive(g as unknown, 'ghost')).toEqual({
        platform: 'kick',
        live: false,
        channelName: 'ghost',
      });
    }
  });

  it('stream.is_live → live:true z mapowaniem pól', () => {
    const out = parseKickLive(
      {
        data: [
          {
            stream_title: 'Gramy!',
            category: { name: 'Just Chatting' },
            stream: { is_live: true, viewer_count: 123, thumbnail: 'https://img/t.jpg' },
          },
        ],
      },
      'ghost',
    );
    expect(out).toEqual({
      platform: 'kick',
      live: true,
      title: 'Gramy!',
      game: 'Just Chatting',
      viewers: 123,
      channelName: 'ghost',
      url: 'https://kick.com/ghost',
      thumbnail: 'https://img/t.jpg',
    });
  });

  it('puste game/thumbnail → undefined (nie pusty string)', () => {
    const out = parseKickLive(
      {
        data: [
          { stream: { is_live: true, viewer_count: 1, thumbnail: '' }, category: { name: '' } },
        ],
      },
      'ghost',
    );
    expect(out.game).toBeUndefined();
    expect(out.thumbnail).toBeUndefined();
  });
});
