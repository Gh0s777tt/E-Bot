// Rygiel kontraktu akcji pluginów community (pluginActionSchema/pluginResponseSchema) — granica
// zaufania z OBCYM kodem (M6 sandbox). Host wykonuje TYLKO akcje, które przejdą walidację, więc
// luka tu = plugin żąda nieograniczonej liczby akcji, przerośniętych pól albo nieznanego typu akcji.
// security.test.ts pokrył SSRF-guard tego modułu, NIE schematy akcji. Czysta walidacja zod.
import { describe, expect, it } from 'vitest';
import { pluginActionSchema, pluginResponseSchema } from './pluginRunner';

const ok = (v: unknown) => pluginResponseSchema.safeParse(v).success;

describe('pluginActionSchema — dozwolone typy akcji (discriminated union)', () => {
  it('akceptuje 3 znane typy', () => {
    expect(
      pluginActionSchema.safeParse({ type: 'sendMessage', channelId: '1', content: 'hi' }).success,
    ).toBe(true);
    expect(
      pluginActionSchema.safeParse({ type: 'addRole', userId: '1', roleId: '2' }).success,
    ).toBe(true);
    expect(pluginActionSchema.safeParse({ type: 'setConfig', key: 'k', value: 'v' }).success).toBe(
      true,
    );
  });

  it('RYGIEL: nieznany typ akcji → odrzucony (plugin nie wymyśli sobie nowej akcji)', () => {
    expect(pluginActionSchema.safeParse({ type: 'banUser', userId: '1' }).success).toBe(false);
    expect(pluginActionSchema.safeParse({ type: 'deleteChannel', channelId: '1' }).success).toBe(
      false,
    );
  });

  it('brak wymaganego pola → odrzucony', () => {
    expect(pluginActionSchema.safeParse({ type: 'sendMessage', channelId: '1' }).success).toBe(
      false,
    ); // brak content
    expect(pluginActionSchema.safeParse({ type: 'addRole', userId: '1' }).success).toBe(false); // brak roleId
  });
});

describe('pluginResponseSchema — limity anty-abuse', () => {
  it('poprawna odpowiedź (miks typów) + pusta lista akcji', () => {
    expect(
      ok({
        actions: [
          { type: 'sendMessage', channelId: '1', content: 'hi' },
          { type: 'addRole', userId: '1', roleId: '2' },
          { type: 'setConfig', key: 'k', value: 'v' },
        ],
      }),
    ).toBe(true);
    expect(ok({ actions: [] })).toBe(true);
  });

  it('RYGIEL: max 20 akcji (anty-abuse — plugin nie zaleje hosta)', () => {
    const action = { type: 'addRole', userId: '1', roleId: '2' };
    expect(ok({ actions: Array(20).fill(action) })).toBe(true);
    expect(ok({ actions: Array(21).fill(action) })).toBe(false);
  });

  it('brak `actions` / zły kształt → odrzucony', () => {
    expect(ok({})).toBe(false);
    expect(ok({ actions: 'nie-tablica' })).toBe(false);
    expect(ok(null)).toBe(false);
  });
});

describe('pluginActionSchema — limity długości pól (anty-przerost payloadu)', () => {
  it('content ≤ 2000', () => {
    expect(
      ok({ actions: [{ type: 'sendMessage', channelId: '1', content: 'A'.repeat(2000) }] }),
    ).toBe(true);
    expect(
      ok({ actions: [{ type: 'sendMessage', channelId: '1', content: 'A'.repeat(2001) }] }),
    ).toBe(false);
  });

  it('id ≤ 32 (channelId/userId/roleId)', () => {
    expect(
      ok({ actions: [{ type: 'sendMessage', channelId: 'A'.repeat(33), content: 'x' }] }),
    ).toBe(false);
    expect(ok({ actions: [{ type: 'addRole', userId: '1', roleId: 'A'.repeat(33) }] })).toBe(false);
  });

  it('setConfig: key ≤ 64, value ≤ 4000', () => {
    expect(ok({ actions: [{ type: 'setConfig', key: 'A'.repeat(65), value: 'v' }] })).toBe(false);
    expect(ok({ actions: [{ type: 'setConfig', key: 'k', value: 'A'.repeat(4001) }] })).toBe(false);
  });
});
