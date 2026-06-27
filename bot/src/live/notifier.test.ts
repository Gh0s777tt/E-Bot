// Rygiel powiadomień live (fillVars · sec). fillVars renderuje szablon ogłoszenia „streamer LIVE" —
// regresja = placeholder zostaje surowy ({title}) albo „undefined" w ogłoszeniu. Puste pola → ''.
// sec parsuje sekundy interwału z env: tylko skończona dodatnia liczba; inaczej domyślna (anty-0/NaN).
import { describe, expect, it } from 'vitest';
import { fillVars, liveChannel, parseLiveCfg, sec } from './notifier.mts';
import type { LiveStatus } from './types.mts';

const st = (o: Partial<LiveStatus>): LiveStatus =>
  ({ platform: 'twitch', channelName: 'Ghost', ...o }) as LiveStatus;

describe('fillVars — render szablonu ogłoszenia live', () => {
  it('podstawia wszystkie znane placeholdery', () => {
    const out = fillVars(
      '{mention} | {streamer} gra w {game}: {title} → {url} ({platform})',
      st({
        title: 'Stream',
        url: 'https://twitch.tv/ghost',
        game: 'E-BOT',
      }),
      '@here',
    );
    expect(out).toBe('@here | Ghost gra w E-BOT: Stream → https://twitch.tv/ghost (Twitch)');
  });

  it('puste/niezdefiniowane pola → "" (nie „undefined")', () => {
    const out = fillVars('[{title}][{game}][{url}]', st({}), '@x');
    expect(out).toBe('[][][]');
  });

  it('{viewers}: liczba → string; brak → ""', () => {
    expect(fillVars('{viewers}', st({ viewers: 42 }), '')).toBe('42');
    expect(fillVars('{viewers}', st({ viewers: null }), '')).toBe('');
  });

  it('RYGIEL wszystkich wystąpień: powtórzony placeholder podstawiony wielokrotnie', () => {
    expect(fillVars('{game} i {game}', st({ game: 'X' }), '')).toBe('X i X');
  });

  it('nieznany placeholder zostaje surowy; wynik przycięty (trim)', () => {
    expect(fillVars('  {nieznane} {streamer}  ', st({}), '')).toBe('{nieznane} Ghost');
  });
});

describe('sec — parser sekund interwału z env', () => {
  it('skończona dodatnia liczba → ona', () => {
    expect(sec('30', 60)).toBe(30);
  });

  it('RYGIEL: 0 / ujemne / NaN / undefined → domyślna', () => {
    expect(sec('0', 60)).toBe(60);
    expect(sec('-5', 60)).toBe(60);
    expect(sec('abc', 60)).toBe(60);
    expect(sec(undefined, 60)).toBe(60);
  });
});

describe('parseLiveCfg — konfiguracja kanałów live z panelu', () => {
  it('poprawny JSON → obiekt', () => {
    expect(parseLiveCfg('{"twitch":"ghost","kick":"gh0st"}')).toEqual({
      twitch: 'ghost',
      kick: 'gh0st',
    });
  });
  it('brak / pusty → {}', () => {
    expect(parseLiveCfg(undefined)).toEqual({});
    expect(parseLiveCfg('')).toEqual({});
  });
  it('zły JSON → {} (bot się nie wywala)', () => {
    expect(parseLiveCfg('{nie-json')).toEqual({});
  });
  it('nie-obiekt (null/liczba) → {}', () => {
    expect(parseLiveCfg('null')).toEqual({});
    expect(parseLiveCfg('5')).toEqual({});
  });
});

describe('liveChannel — panel wygrywa, env fallback', () => {
  it('panel ustawiony → wygrywa nad env', () => {
    expect(liveChannel({ twitch: 'z-panelu' }, 'z-env', 'twitch')).toBe('z-panelu');
  });
  it('panel pusty → env fallback', () => {
    expect(liveChannel({}, 'z-env', 'twitch')).toBe('z-env');
    expect(liveChannel({ twitch: '' }, 'z-env', 'twitch')).toBe('z-env');
  });
  it('oba puste → "" (tick pominie)', () => {
    expect(liveChannel({}, undefined, 'kick')).toBe('');
  });
  it('przycina białe znaki', () => {
    expect(liveChannel({ rumble: '  https://x  ' }, undefined, 'rumble')).toBe('https://x');
  });
  it('izolacja platform — youtube nie bierze kanału twitcha', () => {
    expect(liveChannel({ twitch: 'a' }, undefined, 'youtube')).toBe('');
  });
});
