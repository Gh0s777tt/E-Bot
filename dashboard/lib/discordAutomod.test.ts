// Rygiel mappera natywnego AutoModa (mapRule) — raw API Discorda (snake_case) → NativeRule panelu
// (camelCase). Regresja = panel moderacji pokazuje/zarządza regułami błędnie: gubi keywords, zeruje
// limit wzmianek, traci kanał akcji. Czysta transformacja — defaulty `?? []` / `?? null` muszą trzymać.
import { describe, expect, it } from 'vitest';
import { mapRule } from './discordAutomod';

describe('mapRule — pełna reguła (snake → camel)', () => {
  it('mapuje wszystkie pola + metadane akcji', () => {
    const out = mapRule({
      id: '99',
      name: 'Anty-link',
      enabled: true,
      trigger_type: 1,
      trigger_metadata: {
        keyword_filter: ['http://', 'discord.gg'],
        presets: [1, 3],
        mention_total_limit: 5,
      },
      actions: [
        { type: 1, metadata: {} }, // block
        { type: 3, metadata: { channel_id: '123', duration_seconds: 600 } }, // timeout
      ],
    });
    expect(out).toEqual({
      id: '99',
      name: 'Anty-link',
      enabled: true,
      triggerType: 1,
      keywords: ['http://', 'discord.gg'],
      presets: [1, 3],
      mentionLimit: 5,
      actions: [
        { type: 1, channelId: undefined, durationSec: undefined },
        { type: 3, channelId: '123', durationSec: 600 },
      ],
    });
  });
});

describe('mapRule — defaulty przy brakach', () => {
  it('brak trigger_metadata → keywords [], presets [], mentionLimit null', () => {
    const out = mapRule({ id: '1', name: 'x', enabled: false, trigger_type: 3, actions: [] });
    expect(out.keywords).toEqual([]);
    expect(out.presets).toEqual([]);
    expect(out.mentionLimit).toBeNull();
    expect(out.actions).toEqual([]);
  });

  it('RYGIEL: mention_total_limit = 0 zostaje 0 (nie null — `?? null` nie nadpisuje zera)', () => {
    const out = mapRule({
      id: '1',
      name: 'x',
      enabled: true,
      trigger_type: 5,
      trigger_metadata: { mention_total_limit: 0 },
      actions: [],
    });
    expect(out.mentionLimit).toBe(0);
  });

  it('brak actions → [] (bez wyjątku)', () => {
    const out = mapRule({
      id: '1',
      name: 'x',
      enabled: true,
      trigger_type: 1,
    } as unknown as Parameters<typeof mapRule>[0]);
    expect(out.actions).toEqual([]);
  });
});
