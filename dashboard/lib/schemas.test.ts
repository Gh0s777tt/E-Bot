import { describe, expect, it } from 'vitest';
import { creatorSchema, starboardSchema, wishlistAddSchema } from './schemas';

describe('wishlistAddSchema', () => {
  it('akceptuje minimalny wpis', () => {
    expect(wishlistAddSchema.safeParse({ title: 'Hades' }).success).toBe(true);
  });
  it('odrzuca pusty tytuł', () => {
    expect(wishlistAddSchema.safeParse({ title: '' }).success).toBe(false);
  });
});

describe('starboardSchema', () => {
  it('waliduje poprawny próg', () => {
    const r = starboardSchema.safeParse({
      enabled: true,
      channelId: '123',
      threshold: 3,
      emoji: '⭐',
    });
    expect(r.success).toBe(true);
  });
  it('odrzuca próg 0 i puste emoji', () => {
    expect(
      starboardSchema.safeParse({ enabled: true, channelId: '1', threshold: 0, emoji: '⭐' })
        .success,
    ).toBe(false);
    expect(
      starboardSchema.safeParse({ enabled: true, channelId: '1', threshold: 3, emoji: '' }).success,
    ).toBe(false);
  });
});

describe('creatorSchema', () => {
  it('wymusza zakres pollMin (2–120)', () => {
    const base = { autoEvent: false, eventName: '', clipRelay: true, clipChannelId: '1' };
    expect(creatorSchema.safeParse({ ...base, pollMin: 10 }).success).toBe(true);
    expect(creatorSchema.safeParse({ ...base, pollMin: 1 }).success).toBe(false);
    expect(creatorSchema.safeParse({ ...base, pollMin: 999 }).success).toBe(false);
  });
});
