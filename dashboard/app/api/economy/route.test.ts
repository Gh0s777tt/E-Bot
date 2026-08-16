// Test kontraktowy trasy (audyt A-2, fala 4): ekonomia serwera. Tu zły zapis nie psuje ekranu —
// przestawia wypłaty, napiwki i limity hazardu dla wszystkich na serwerze naraz, a skutek widać
// dopiero po fakcie, w saldach. Kontrakt trzyma więc granice liczbowe schematu.
// Uwaga: ta trasa (w odróżnieniu od `automod`/`antinuke`) NIE woła `recordAudit` — testy poniżej
// utrwalają stan FAKTYCZNY, nie postulowany; rozjazd jest zgłoszony osobno.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../lib/serverEconomy', () => ({
  getServerEconomy: vi.fn(),
  saveServerEconomy: vi.fn(),
}));

import { getServerEconomy, saveServerEconomy } from '../../../lib/serverEconomy';
import { GET, POST } from './route';

const load = vi.mocked(getServerEconomy);
const save = vi.mocked(saveServerEconomy);

const POPRAWNY = {
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

function req(body: unknown): Request {
  return new Request('https://panel.e-forge.test/api/economy', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function bladZ(res: Response): Promise<string> {
  return ((await res.json()) as { error: string }).error;
}

beforeEach(() => {
  vi.clearAllMocks();
  load.mockResolvedValue(POPRAWNY as never);
  save.mockResolvedValue(undefined as never);
});

describe('POST /api/economy — ścieżka zapisu', () => {
  it('poprawny config → 200 { ok: true, config } + zapis', async () => {
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, config: POPRAWNY });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('pola opcjonalne pominięte w body → zapisane jako 0, nie `undefined`', async () => {
    await POST(req(POPRAWNY));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ bankInterestPct: 0, payTaxPct: 0, levelUpMoney: 0 }),
    );
  });

  it('odpowiedź zwraca config ODCZYTANY PO zapisie, nie echo wejścia', async () => {
    load.mockResolvedValue({ ...POPRAWNY, dailyAmount: 777 } as never);
    const res = await POST(req({ ...POPRAWNY, dailyAmount: 50 }));
    await expect(res.json()).resolves.toMatchObject({ config: { dailyAmount: 777 } });
  });

  it('nieznane pola są obcinane — do configu nie trafia nic spoza schematu', async () => {
    await POST(req({ ...POPRAWNY, secretMultiplier: 9000 }));
    expect(save).toHaveBeenCalledWith(
      expect.not.objectContaining({ secretMultiplier: expect.anything() }),
    );
  });
});

describe('POST /api/economy — granice kwot i procentów', () => {
  it.each([
    ['ujemne saldo startowe', { startBalance: -1 }],
    ['dzienna wypłata ponad milion', { dailyAmount: 1_000_001 }],
    ['kwota z groszami (schemat wymaga liczb całkowitych)', { dailyAmount: 12.5 }],
    ['szansa na rabunek ponad 100%', { robChance: 101 }],
    ['ujemna szansa na rabunek', { robChance: -1 }],
    ['rabunek 0% majątku (min. 1)', { robMaxPercent: 0 }],
    ['cooldown pracy ponad tydzień', { workCooldownMin: 10_081 }],
    ['stawka hazardu równa 0 (min. 1)', { gambleMax: 0 }],
    ['podatek od przelewu ponad 50%', { payTaxPct: 51 }],
    ['odsetki bankowe ponad 100%', { bankInterestPct: 101 }],
    ['pusta nazwa waluty', { currency: '' }],
    ['nazwa waluty ponad 40 znaków', { currency: 'x'.repeat(41) }],
  ])('%s → 400 bez zapisu', async (_opis, patch) => {
    const res = await POST(req({ ...POPRAWNY, ...patch }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it('wartości brzegowe (0 i maksimum) przechodzą — granica jest inkluzywna', async () => {
    const res = await POST(
      req({
        ...POPRAWNY,
        startBalance: 0,
        dailyAmount: 1_000_000,
        robChance: 100,
        robMaxPercent: 1,
        payTaxPct: 50,
      }),
    );
    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
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

  it('odwrócony przedział pracy (workMin > workMax) → 400 bez zapisu', async () => {
    const res = await POST(req({ ...POPRAWNY, workMin: 500, workMax: 10 }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it('błąd odwróconego przedziału wskazuje pole `workMax` — panel ma co podświetlić', async () => {
    const res = await POST(req({ ...POPRAWNY, workMin: 500, workMax: 10 }));
    await expect(bladZ(res)).resolves.toMatch(/^workMax: /);
  });

  it('przedział jednopunktowy (workMin === workMax) przechodzi — stała wypłata jest legalna', async () => {
    const res = await POST(req({ ...POPRAWNY, workMin: 100, workMax: 100 }));
    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/economy', () => {
  it('zwraca zapisany config', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(POPRAWNY);
  });
});
