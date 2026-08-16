import { describe, expect, it } from 'vitest';
import { creatorSchema, economySchema, starboardSchema, wishlistAddSchema } from './schemas';

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

describe('economySchema — zakres wypłaty za pracę', () => {
  const base = {
    enabled: true,
    currency: 'dukaty',
    startBalance: 100,
    dailyAmount: 50,
    dailyStreakBonus: 10,
    workMin: 10,
    workMax: 100,
    workCooldownMin: 60,
    robEnabled: true,
    robChance: 30,
    robCooldownMin: 120,
    robMaxPercent: 20,
    gambleEnabled: true,
    gambleMax: 1000,
  };

  it('przedział rosnący i jednopunktowy przechodzą', () => {
    expect(economySchema.safeParse(base).success).toBe(true);
    expect(economySchema.safeParse({ ...base, workMin: 100, workMax: 100 }).success).toBe(true);
  });

  it('odwrócony przedział jest odrzucany na ścieżce `workMax`', () => {
    const r = economySchema.safeParse({ ...base, workMin: 500, workMax: 10 });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(['workMax']);
  });
});
