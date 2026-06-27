// Testy IZOLACJI MULTI-TENANT — rygiel na regresję IDOR (v0.318). Klucz `service_role` OMIJA RLS,
// więc scope per-serwer w aplikacji to JEDYNA autoryzacja: każde zapytanie scoped MUSI nałożyć
// `.eq('guild_id', gid)`. Klient Supabase mockujemy chainable+thenable proxy (nagrywa `.eq`/`.from`/
// `.insert`) + `getPrimaryGuildId` — bez sieci, bez realnej bazy. Ktoś, kto usunie scope → test failuje.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getGiveaways } from './engagement';
import {
  closeTicket,
  getHallOfFame,
  getModCases,
  getSuggestions,
  getTempBans,
  getTickets,
} from './faza4';
import { addShopItem, getShopItems, removeShopItem } from './serverEconomy';

const h = vi.hoisted(() => {
  const GID = 'GUILD_PRIMARY';
  const eqCalls: Array<[string, unknown]> = [];
  const fromTables: string[] = [];
  const inserts: unknown[] = [];
  const builder: any = new Proxy(
    {},
    {
      get(_t, prop) {
        if (typeof prop === 'symbol') return undefined;
        if (prop === 'then') {
          return (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null });
        }
        if (prop === 'eq') {
          return (col: string, val: unknown) => {
            eqCalls.push([col, val]);
            return builder;
          };
        }
        if (prop === 'from') {
          return (table: string) => {
            fromTables.push(table);
            return builder;
          };
        }
        if (prop === 'insert') {
          return (rows: unknown) => {
            inserts.push(rows);
            return builder;
          };
        }
        return () => builder;
      },
    },
  );
  const getPrimaryGuildId = vi.fn(() => Promise.resolve<string | null>(GID));
  return { GID, eqCalls, fromTables, inserts, builder, getPrimaryGuildId };
});

vi.mock('./supabase', () => ({ hasSupabase: true, supabase: () => h.builder }));
vi.mock('./guild', () => ({ getPrimaryGuildId: h.getPrimaryGuildId }));
vi.mock('./data', () => ({
  getConfigSetting: () => Promise.resolve(null),
  getRawSetting: () => Promise.resolve(null),
  setConfigSetting: () => Promise.resolve(),
  setRawSetting: () => Promise.resolve(),
}));

afterEach(() => {
  h.eqCalls.length = 0;
  h.fromTables.length = 0;
  h.inserts.length = 0;
  h.getPrimaryGuildId.mockReset();
  h.getPrimaryGuildId.mockImplementation(() => Promise.resolve<string | null>(h.GID));
});

const scopedToGuild = (): boolean =>
  h.eqCalls.some(([col, val]) => col === 'guild_id' && val === h.GID);

describe('Izolacja multi-tenant — scope guild_id (rygiel anty-IDOR z v0.318)', () => {
  it('removeShopItem (DELETE) nakłada .eq(guild_id) i celuje w economy_shop', async () => {
    const r = await removeShopItem('item-x');
    expect(r.ok).toBe(true);
    expect(scopedToGuild()).toBe(true);
    expect(h.fromTables).toContain('economy_shop');
  });

  it('getShopItems (SELECT) nakłada .eq(guild_id)', async () => {
    await getShopItems();
    expect(scopedToGuild()).toBe(true);
  });

  it('addShopItem (INSERT) zapisuje guild_id w payloadzie', async () => {
    const r = await addShopItem({ name: 'miecz', price: 100 });
    expect(r.ok).toBe(true);
    const payload = (h.inserts[0] as Array<Record<string, unknown>>)?.[0];
    expect(payload?.guild_id).toBe(h.GID);
  });

  it('getTickets (SELECT) nakłada .eq(guild_id) — ODCZYT nie przecieka cudzych ticketów', async () => {
    await getTickets();
    expect(scopedToGuild()).toBe(true);
    expect(h.fromTables).toContain('tickets');
  });

  it('closeTicket (UPDATE) nakłada .eq(guild_id)', async () => {
    const ok = await closeTicket('ticket-x');
    expect(ok).toBe(true);
    expect(scopedToGuild()).toBe(true);
  });

  it('getModCases (SELECT) nakłada .eq(guild_id) — historia moderacji nie przecieka', async () => {
    await getModCases();
    expect(scopedToGuild()).toBe(true);
    expect(h.fromTables).toContain('mod_cases');
  });

  it('getTempBans (SELECT) nakłada .eq(guild_id)', async () => {
    await getTempBans();
    expect(scopedToGuild()).toBe(true);
    expect(h.fromTables).toContain('temp_bans');
  });

  it('getSuggestions (SELECT) nakłada .eq(guild_id)', async () => {
    await getSuggestions();
    expect(scopedToGuild()).toBe(true);
    expect(h.fromTables).toContain('suggestions');
  });

  it('getHallOfFame (SELECT) nakłada .eq(guild_id) na obu zapytaniach', async () => {
    await getHallOfFame();
    expect(scopedToGuild()).toBe(true);
    expect(h.fromTables).toContain('xp_hall_of_fame');
  });

  it('getGiveaways (SELECT) nakłada .eq(guild_id)', async () => {
    await getGiveaways();
    expect(scopedToGuild()).toBe(true);
    expect(h.fromTables).toContain('giveaways');
  });

  it('fail-closed: brak primary guild → brak zapytania (pusto/false), builder nietknięty', async () => {
    h.getPrimaryGuildId.mockImplementation(() => Promise.resolve<string | null>(null));
    expect(await getTickets()).toEqual([]);
    expect(await closeTicket('x')).toBe(false);
    expect(await removeShopItem('x')).toEqual({ ok: false, error: 'Brak serwera' });
    expect(await getModCases()).toEqual([]);
    expect(await getTempBans()).toEqual([]);
    expect(await getSuggestions()).toEqual([]);
    expect(await getHallOfFame()).toEqual([]);
    expect(await getGiveaways()).toEqual([]);
    expect(h.eqCalls).toHaveLength(0);
  });
});
