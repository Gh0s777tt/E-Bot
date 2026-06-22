// Rygiel snapshotu struktury serwera (captureGuild) — Architekt/Security (Etap G). Czysta transformacja
// Guild → Snapshot. KLUCZ: NIE snapshotujemy ról zarządzanych (bot/integracje) ani @everyone — restore
// próbowałby je odtworzyć i albo padał, albo dublował uprawnienia. Sort wg pozycji malejąco, kap 100 ról
// / 200 kanałów, kanały tylko z dozwolonych typów (kategorie pierwsze — restore tworzy rodziców wcześniej).
import { ChannelType, type Guild } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { captureGuild } from './backup.mts';

type R = {
  id: string;
  name: string;
  position: number;
  managed?: boolean;
  perms?: bigint;
};
const role = (o: R) => ({
  id: o.id,
  name: o.name,
  position: o.position,
  managed: !!o.managed,
  color: 0,
  hoist: false,
  mentionable: false,
  permissions: { bitfield: o.perms ?? 0n },
});
type C = { name: string; type: number; position?: number };
const chan = (o: C) => ({ name: o.name, type: o.type, position: o.position ?? 0, parent: null });

const GID = 'GUILD';
const guild = (roles: ReturnType<typeof role>[], channels: ReturnType<typeof chan>[] = []): Guild =>
  ({
    id: GID,
    roles: { cache: new Map(roles.map((r) => [r.id, r])) },
    channels: { cache: new Map(channels.map((c, i) => [`c${i}`, c])) },
  }) as unknown as Guild;

describe('captureGuild — snapshot ról', () => {
  it('RYGIEL: pomija role zarządzane (bot/integracje) i @everyone (id === guild.id)', () => {
    const snap = captureGuild(
      guild([
        role({ id: GID, name: '@everyone', position: 0 }),
        role({ id: 'bot', name: 'BotRole', position: 5, managed: true }),
        role({ id: 'mod', name: 'Mod', position: 3 }),
      ]),
    );
    expect(snap.roles.map((r) => r.name)).toEqual(['Mod']);
  });

  it('sortuje role malejąco wg pozycji i mapuje pola (permissions jako string)', () => {
    const snap = captureGuild(
      guild([
        role({ id: 'a', name: 'Low', position: 1, perms: 8n }),
        role({ id: 'b', name: 'High', position: 9, perms: 123n }),
        role({ id: 'c', name: 'Mid', position: 4 }),
      ]),
    );
    expect(snap.roles.map((r) => r.name)).toEqual(['High', 'Mid', 'Low']);
    expect(snap.roles[0].permissions).toBe('123'); // bitfield → string
    expect(typeof snap.roles[0].permissions).toBe('string');
  });

  it('RYGIEL kapu 100 ról', () => {
    const many = Array.from({ length: 120 }, (_, i) =>
      role({ id: `r${i}`, name: `R${i}`, position: i }),
    );
    expect(captureGuild(guild(many)).roles).toHaveLength(100);
  });
});

describe('captureGuild — snapshot kanałów', () => {
  it('bierze tylko dozwolone typy (text/voice/category/announcement), pomija wątki/forum', () => {
    const snap = captureGuild(
      guild(
        [],
        [
          chan({ name: 'ogolny', type: ChannelType.GuildText }),
          chan({ name: 'glos', type: ChannelType.GuildVoice }),
          chan({ name: 'watek', type: ChannelType.PublicThread }),
          chan({ name: 'forum', type: ChannelType.GuildForum }),
        ],
      ),
    );
    expect(snap.channels.map((c) => c.name).sort()).toEqual(['glos', 'ogolny']);
  });

  it('RYGIEL kolejności: kategorie przed innymi kanałami (restore tworzy rodziców wcześniej)', () => {
    const snap = captureGuild(
      guild(
        [],
        [
          chan({ name: 'tekst', type: ChannelType.GuildText, position: 0 }),
          chan({ name: 'Kategoria', type: ChannelType.GuildCategory, position: 1 }),
        ],
      ),
    );
    expect(snap.channels[0].type).toBe(ChannelType.GuildCategory);
  });

  it('zawsze stempel czasu (at) i tablice', () => {
    const snap = captureGuild(guild([], []));
    expect(snap.at).toBeGreaterThan(0);
    expect(Array.isArray(snap.roles)).toBe(true);
    expect(Array.isArray(snap.channels)).toBe(true);
  });
});
