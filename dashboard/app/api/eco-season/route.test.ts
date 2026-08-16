// Test kontraktowy trasy (audyt A-2, fala 4): sezon ekonomii. Wyróżnik tej trasy to pole `reset` —
// zwykły boolean w configu, który dla graczy oznacza wyzerowanie sezonu. Kontrakt pilnuje, żeby
// przechodziło ono do zapisu DOKŁADNIE takie, jakie przyszło: ani domyślnie włączone (przypadkowy
// reset), ani cicho gubione (reset, który nie zadziałał).
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../lib/serverEconomy', () => ({ getEcoSeason: vi.fn(), saveEcoSeason: vi.fn() }));

import { getEcoSeason, saveEcoSeason } from '../../../lib/serverEconomy';
import { GET, POST } from './route';

const load = vi.mocked(getEcoSeason);
const save = vi.mocked(saveEcoSeason);

const POPRAWNY = {
  enabled: true,
  channelId: '123',
  reward1: 1000,
  reward2: 500,
  reward3: 250,
  reset: false,
};

function req(body: unknown): Request {
  return new Request('https://panel.e-forge.test/api/eco-season', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  load.mockResolvedValue(POPRAWNY as never);
  save.mockResolvedValue(undefined as never);
});

describe('POST /api/eco-season', () => {
  it('poprawny config → 200 { ok: true, config } + zapis', async () => {
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, config: POPRAWNY });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('`reset: %s` trafia do zapisu bez zmiany', async (reset) => {
    await POST(req({ ...POPRAWNY, reset }));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ reset }));
  });

  it('brak `reset` w body → 400, a NIE cichy domyślny reset', async () => {
    const { reset: _pominiete, ...bezResetu } = POPRAWNY;
    const res = await POST(req(bezResetu));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it.each([
    ['nagroda ujemna', { reward1: -1 }],
    ['nagroda ponad 100 mln', { reward1: 100_000_001 }],
    ['nagroda ułamkowa', { reward2: 10.5 }],
    ['id kanału ponad 40 znaków', { channelId: '1'.repeat(41) }],
    ['`reset` jako string zamiast boolean', { reset: 'tak' }],
  ])('%s → 400 bez zapisu', async (_opis, patch) => {
    const res = await POST(req({ ...POPRAWNY, ...patch }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it('zerowe nagrody przechodzą — sezon bez puli to poprawna konfiguracja', async () => {
    const res = await POST(req({ ...POPRAWNY, reward1: 0, reward2: 0, reward3: 0 }));
    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('body nie będące JSON-em → 400 bez zapisu', async () => {
    const res = await POST(req('{nie-json'));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it('odpowiedź zwraca config ODCZYTANY PO zapisie, nie echo wejścia', async () => {
    load.mockResolvedValue({ ...POPRAWNY, reward1: 42 } as never);
    const res = await POST(req({ ...POPRAWNY, reward1: 1000 }));
    await expect(res.json()).resolves.toMatchObject({ config: { reward1: 42 } });
  });
});

describe('GET /api/eco-season', () => {
  it('zwraca zapisany config', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(POPRAWNY);
  });
});
