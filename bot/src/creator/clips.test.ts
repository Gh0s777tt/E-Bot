// Rygiel embeda klipu Twitch (clipEmbed) — Clip z Helix API → EmbedBuilder relayu.
// KLUCZ: tytuł z fallbackiem 'Klip' (puste title z API), URL klipu, stopka „klip od <autor>",
// kolor Twitcha, timestamp z created_at. RYGIEL warunku: setImage TYLKO gdy thumbnail_url niepuste
// (puste → brak obrazka, inaczej Discord odrzuca embed z pustym image.url). Regresja = zepsuty embed
// relayu (brak linku, zła stopka) albo wywalona publikacja przez pusty obrazek.
import { describe, expect, it } from 'vitest';
import { type Clip, clipEmbed } from './clips.mts';

const base: Clip = {
  id: 'abc',
  url: 'https://clips.twitch.tv/abc',
  title: 'Insane play',
  created_at: '2026-06-22T10:00:00.000Z',
  thumbnail_url: 'https://img/thumb.jpg',
  creator_name: 'Ghost',
};

describe('clipEmbed — embed relayu klipu Twitch', () => {
  it('mapuje tytuł, URL, stopkę i kolor Twitcha', () => {
    const j = clipEmbed(base).toJSON();
    expect(j.title).toBe('Insane play');
    expect(j.url).toBe('https://clips.twitch.tv/abc');
    expect(j.footer?.text).toBe('klip od Ghost');
    expect(j.author?.name).toBe('Twitch • nowy klip');
    expect(j.color).toBe(0x9146ff);
  });

  it('pusty tytuł z API → fallback „Klip"', () => {
    expect(clipEmbed({ ...base, title: '' }).toJSON().title).toBe('Klip');
  });

  it('RYGIEL: setImage tylko gdy thumbnail_url niepuste', () => {
    expect(clipEmbed(base).toJSON().image?.url).toBe('https://img/thumb.jpg');
    expect(clipEmbed({ ...base, thumbnail_url: '' }).toJSON().image).toBeUndefined();
  });

  it('timestamp pochodzi z created_at klipu', () => {
    expect(clipEmbed(base).toJSON().timestamp).toBe('2026-06-22T10:00:00.000Z');
  });
});
