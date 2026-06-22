// Rygiel silnika Architekta (findChannel · findId). findChannel: idempotencja provisioningu —
// dopasowanie kanału po nazwie (case-insensitive) ORAZ typie (kategoria vs tekst to różne byty).
// findId: pobranie id z logu prowizjonowania — TYLKO wpis udany (ok) Z id; inaczej referencja do
// nieutworzonego bytu (np. overwrite na nieistniejącą rolę). Czyste, mock Guild minimalny.
import { ChannelType, type Guild } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { findChannel, findId } from './provision.mts';

type Ch = { name: string; type: number };
const guild = (channels: Ch[]): Guild =>
  ({
    channels: { cache: { find: (fn: (c: Ch) => boolean) => channels.find(fn) ?? null } },
  }) as unknown as Guild;

describe('findChannel — dopasowanie kanału (idempotencja)', () => {
  const g = guild([
    { name: 'Ogólny', type: ChannelType.GuildText },
    { name: 'Kategoria', type: ChannelType.GuildCategory },
  ]);

  it('po nazwie case-insensitive + zgodnym typie → kanał', () => {
    expect(findChannel(g, 'ogólny', ChannelType.GuildText)).toMatchObject({ name: 'Ogólny' });
    expect(findChannel(g, 'OGÓLNY', ChannelType.GuildText)).toMatchObject({ name: 'Ogólny' });
  });

  it('RYGIEL typu: ta sama nazwa, inny typ → null (kategoria ≠ kanał tekstowy)', () => {
    expect(findChannel(g, 'Kategoria', ChannelType.GuildText)).toBeNull();
    expect(findChannel(g, 'Ogólny', ChannelType.GuildCategory)).toBeNull();
  });

  it('brak dopasowania → null', () => {
    expect(findChannel(g, 'nie-ma', ChannelType.GuildText)).toBeNull();
  });
});

describe('findId — id z logu prowizjonowania', () => {
  const log = [
    { label: 'Rola: Mod', ok: true, id: 'r1' },
    { label: 'Rola: Failed', ok: false, id: 'r2' },
    { label: 'Rola: NoId', ok: true },
    { label: 'Rola: Mod', ok: true, id: 'r1-dup' },
  ];

  it('udany wpis z id → id (pierwszy pasujący)', () => {
    expect(findId(log, 'Rola: Mod')).toBe('r1');
  });

  it('RYGIEL: wpis nieudany (ok:false) → undefined (brak referencji do nieutworzonego bytu)', () => {
    expect(findId(log, 'Rola: Failed')).toBeUndefined();
  });

  it('wpis udany bez id → undefined', () => {
    expect(findId(log, 'Rola: NoId')).toBeUndefined();
  });

  it('brak etykiety → undefined', () => {
    expect(findId(log, 'Nieznana')).toBeUndefined();
  });
});
