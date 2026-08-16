// Test kontraktowy trasy (audyt A-2, fala 6): leveling. To config progresji CAŁEGO serwera —
// mnożniki XP, nagrody za poziomy i prestiż — więc zły zapis nie psuje ekranu, tylko po cichu
// przestawia tempo zdobywania rang wszystkim naraz. Kontrakt trzyma granice liczbowe i limity list
// (mnożniki × role, nagrody × poziomy), bo to one chronią przed configiem, który bot musi
// przeliczać przy KAŻDEJ wiadomości i minucie na kanale głosowym.
// Zapis zostawia ślad w dzienniku (`recordAudit`) — tak samo jak `antiraid`/`automod`/`antinuke`.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../lib/faza4', () => ({
  getLevelingConfig: vi.fn(),
  saveLevelingConfig: vi.fn(),
}));
vi.mock('../../../lib/audit', () => ({ recordAudit: vi.fn() }));

import { recordAudit } from '../../../lib/audit';
import { getLevelingConfig, saveLevelingConfig } from '../../../lib/faza4';
import { GET, POST } from './route';

const load = vi.mocked(getLevelingConfig);
const save = vi.mocked(saveLevelingConfig);
const audit = vi.mocked(recordAudit);

const POPRAWNY = {
  enabled: true,
  xpPerMessage: 10,
  xpPerVoiceMin: 5,
  cooldownSec: 60,
  announceChannelId: '123',
  rewards: [{ level: 5, roleId: '456' }],
  weekendBonus: 2,
  multipliers: [{ roleId: '789', factor: 1.5 }],
  noXpChannels: ['111'],
  noXpRoles: ['222'],
  voiceAntiAfk: true,
  stackRewards: false,
  levelUpMessage: 'Gratulacje!',
  prestigeEnabled: true,
  prestigeLevel: 100,
  prestigeRoleId: '333',
};

function req(body: unknown): Request {
  return new Request('https://panel.e-forge.test/api/leveling', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  load.mockResolvedValue(POPRAWNY as never);
  save.mockResolvedValue(undefined as never);
  audit.mockResolvedValue(undefined as never);
});

describe('POST /api/leveling — ścieżka zapisu', () => {
  it('poprawny config → 200 { ok: true, config } + zapis + wpis audytowy', async () => {
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, config: POPRAWNY });
    expect(save).toHaveBeenCalledTimes(1);
    expect(audit).toHaveBeenCalledWith(expect.any(Request), 'leveling');
  });

  it('pola opcjonalne pominięte → domyślne `false`, nie `undefined`', async () => {
    await POST(req(POPRAWNY));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ levelUpDm: false, achievementsEnabled: false }),
    );
  });

  it('odpowiedź zwraca config ODCZYTANY PO zapisie, nie echo wejścia', async () => {
    load.mockResolvedValue({ ...POPRAWNY, xpPerMessage: 999 } as never);
    const res = await POST(req({ ...POPRAWNY, xpPerMessage: 10 }));
    await expect(res.json()).resolves.toMatchObject({ config: { xpPerMessage: 999 } });
  });

  it('nieznane pola są obcinane — do configu nie trafia nic spoza schematu', async () => {
    await POST(req({ ...POPRAWNY, xpHack: 9999 }));
    expect(save).toHaveBeenCalledWith(expect.not.objectContaining({ xpHack: expect.anything() }));
  });
});

describe('POST /api/leveling — granice XP i mnożników', () => {
  it.each([
    ['XP za wiadomość ponad 1000', { xpPerMessage: 1001 }],
    ['ujemne XP za wiadomość', { xpPerMessage: -1 }],
    ['XP ułamkowe', { xpPerMessage: 2.5 }],
    ['XP głosowe ponad 1000', { xpPerVoiceMin: 1001 }],
    ['cooldown ponad godzinę', { cooldownSec: 3601 }],
    // Mnożnik < 1 ODEJMOWAŁBY XP zamiast dodawać — schemat wymaga minimum 1.
    ['mnożnik poniżej 1', { multipliers: [{ roleId: '1', factor: 0.5 }] }],
    ['mnożnik ponad 10', { multipliers: [{ roleId: '1', factor: 11 }] }],
    ['bonus weekendowy poniżej 1', { weekendBonus: 0.5 }],
    ['bonus weekendowy ponad 10', { weekendBonus: 11 }],
    ['poziom nagrody 0 (minimum to 1)', { rewards: [{ level: 0, roleId: '1' }] }],
    ['poziom nagrody ponad 1000', { rewards: [{ level: 1001, roleId: '1' }] }],
    ['prestiż poniżej 1', { prestigeLevel: 0 }],
    [
      'ponad 100 nagród',
      { rewards: Array.from({ length: 101 }, (_, i) => ({ level: i + 1, roleId: '1' })) },
    ],
    [
      'ponad 50 mnożników',
      { multipliers: Array.from({ length: 51 }, () => ({ roleId: '1', factor: 2 })) },
    ],
    ['ponad 100 kanałów bez XP', { noXpChannels: Array.from({ length: 101 }, () => '1') }],
    ['wiadomość awansu ponad 1000 znaków', { levelUpMessage: 'x'.repeat(1001) }],
  ])('%s → 400, zero zapisu i ZERO wpisu w audycie', async (_opis, patch) => {
    const res = await POST(req({ ...POPRAWNY, ...patch }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
    // Audyt to dziennik REALNYCH zmian — odrzucone żądanie nie ma prawa go zaśmiecać.
    expect(audit).not.toHaveBeenCalled();
  });

  it('zerowe XP przechodzi — to sposób na wyłączenie zdobywania bez wyłączania modułu', async () => {
    const res = await POST(req({ ...POPRAWNY, xpPerMessage: 0, xpPerVoiceMin: 0, cooldownSec: 0 }));
    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('mnożnik dokładnie 1 i 10 przechodzi — granica jest inkluzywna', async () => {
    const res = await POST(
      req({
        ...POPRAWNY,
        multipliers: [
          { roleId: '1', factor: 1 },
          { roleId: '2', factor: 10 },
        ],
      }),
    );
    expect(res.status).toBe(200);
  });

  it('body nie będące JSON-em → 400 bez zapisu', async () => {
    const res = await POST(req('{nie-json'));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it('puste body → 400, a nie zapis samych domyślnych', async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });
});

describe('GET /api/leveling', () => {
  it('zwraca zapisany config', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(POPRAWNY);
  });
});
