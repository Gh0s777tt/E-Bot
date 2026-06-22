// Rygiel ról z obecności (liveStreaming · vanityMatch) — kto dostaje live-rolę / vanity-rolę.
// Refactor behavior-preserving: predykaty dopasowania wyjęte z applyLive/applyVanity (gating
// enabled/roleId zostaje w handlerach). KLUCZ: live-rola tylko gdy streaming ORAZ (brak wymaganej
// roli LUB user ją ma) — filtr przed rozdaniem roli komu popadnie; vanity = fraza w statusie (CI).
import { ActivityType } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { liveStreaming, vanityMatch } from './presenceRoles.mts';

const act = (...types: ActivityType[]) => types.map((type) => ({ type }));

describe('liveStreaming — kwalifikacja do live-roli', () => {
  it('streaming + brak wymaganej roli (requireRoleId pusty) → true', () => {
    expect(liveStreaming(act(ActivityType.Streaming), '', false)).toBe(true);
  });

  it('brak aktywności streaming → false', () => {
    expect(liveStreaming(act(ActivityType.Playing, ActivityType.Custom), '', false)).toBe(false);
    expect(liveStreaming([], '', false)).toBe(false);
  });

  it('RYGIEL filtra roli: streaming, requireRoleId ustawiony, user NIE ma roli → false', () => {
    expect(liveStreaming(act(ActivityType.Streaming), 'rVIP', false)).toBe(false);
  });

  it('streaming, requireRoleId ustawiony, user MA rolę → true', () => {
    expect(liveStreaming(act(ActivityType.Streaming), 'rVIP', true)).toBe(true);
  });
});

describe('vanityMatch — fraza vanity w statusie niestandardowym', () => {
  it('status zawiera frazę (case-insensitive) → true', () => {
    expect(vanityMatch('Gram w E-BOT teraz', 'e-bot')).toBe(true);
    expect(vanityMatch('discord.gg/ghost', 'GHOST')).toBe(true);
  });

  it('status bez frazy → false', () => {
    expect(vanityMatch('zwykły status', 'ghost')).toBe(false);
  });

  it('brak statusu (null/undefined/pusty) → false', () => {
    expect(vanityMatch(null, 'ghost')).toBe(false);
    expect(vanityMatch(undefined, 'ghost')).toBe(false);
    expect(vanityMatch('', 'ghost')).toBe(false);
  });
});
