// Test kontraktowy trasy (audyt A-2, fala 5): pierwsza trasa z BRAMKĄ LIMITU PLANU. Do łańcucha
// „walidacja → zapis → odpowiedź" dochodzi `guardLimit`, czyli miejsce, gdzie kończy się Free
// i zaczyna Premium. Kontrakt pilnuje przede wszystkim KOLEJNOŚCI (schemat przed limitem) oraz
// tego, że odmowa z limitu to 403 z komunikatem dla użytkownika — a NIE cichy zapis obcięty do
// limitu ani 500. Grandfathering (konfiguracja już ponad limitem) żyje w `guardLimit` i ma własne
// testy — tutaj sprawdzamy, że trasa podaje mu prawdziwe „ile jest teraz".
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../lib/community', () => ({
  getCountersConfig: vi.fn(),
  saveCountersConfig: vi.fn(),
}));
vi.mock('../../../lib/planLimits', () => ({ guardLimit: vi.fn() }));
vi.mock('../../../lib/audit', () => ({ recordAudit: vi.fn() }));

import { recordAudit } from '../../../lib/audit';
import { getCountersConfig, saveCountersConfig } from '../../../lib/community';
import { guardLimit } from '../../../lib/planLimits';
import { GET, POST } from './route';

const load = vi.mocked(getCountersConfig);
const save = vi.mocked(saveCountersConfig);
const gate = vi.mocked(guardLimit);
const audit = vi.mocked(recordAudit);

const licznik = (channelId = '1') => ({
  channelId,
  type: 'members' as const,
  template: 'Ludzi: {count}',
});
const POPRAWNY = { enabled: true, items: [licznik()] };

function req(body: unknown): Request {
  return new Request('https://panel.e-forge.test/api/counters', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  load.mockResolvedValue(POPRAWNY as never);
  save.mockResolvedValue(undefined as never);
  gate.mockResolvedValue({ ok: true } as never);
  audit.mockResolvedValue(undefined as never);
});

describe('POST /api/counters — bramka limitu planu', () => {
  it('limit przekroczony → 403 z komunikatem z bramki i ZERO zapisu', async () => {
    gate.mockResolvedValue({ ok: false, error: 'Plan Free: maks. 3 liczniki' } as never);
    const res = await POST(req({ ...POPRAWNY, items: [licznik('1'), licznik('2')] }));
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: 'Plan Free: maks. 3 liczniki',
    });
    expect(save).not.toHaveBeenCalled();
    // Odbicie na limicie to nie zmiana configu — dziennik ma zostać czysty.
    expect(audit).not.toHaveBeenCalled();
  });

  it('bramka dostaje ILE BĘDZIE i ILE JEST — bez tego nie ma grandfatheringu', async () => {
    load.mockResolvedValue({ enabled: true, items: [licznik('1'), licznik('2')] } as never);
    await POST(req({ ...POPRAWNY, items: [licznik('1'), licznik('2'), licznik('3')] }));
    expect(gate).toHaveBeenCalledWith('counters', 3, 2);
  });

  it('config bez `items` w storage → bramka dostaje 0, a nie `undefined`', async () => {
    load.mockResolvedValue({ enabled: true } as never);
    await POST(req(POPRAWNY));
    expect(gate).toHaveBeenCalledWith('counters', 1, 0);
  });

  it('złe body odpada PRZED bramką — limit nie jest nawet pytany', async () => {
    const res = await POST(req({ ...POPRAWNY, items: [{ ...licznik(), type: 'zmyslony' }] }));
    expect(res.status).toBe(400);
    expect(gate).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('usuwanie liczników przy zerowym limicie nadal przechodzi przez bramkę', async () => {
    load.mockResolvedValue({ enabled: true, items: [licznik('1'), licznik('2')] } as never);
    const res = await POST(req({ ...POPRAWNY, items: [] }));
    expect(gate).toHaveBeenCalledWith('counters', 0, 2);
    expect(res.status).toBe(200);
  });
});

describe('POST /api/counters — walidacja', () => {
  it.each([
    ['nieznany typ licznika', { items: [{ ...licznik(), type: 'liczba_smokow' }] }],
    ['pusty szablon', { items: [{ ...licznik(), template: '' }] }],
    ['szablon ponad 100 znaków', { items: [{ ...licznik(), template: 'x'.repeat(101) }] }],
    ['id kanału ponad 40 znaków', { items: [{ ...licznik(), channelId: '1'.repeat(41) }] }],
    ['ponad 20 liczników', { items: Array.from({ length: 21 }, (_, i) => licznik(`${i}`)) }],
    ['`enabled` jako string', { enabled: 'tak' }],
  ])('%s → 400, zero zapisu i ZERO wpisu w audycie', async (_opis, body) => {
    const res = await POST(req({ ...POPRAWNY, ...body }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
  });

  it('brak `items` w body → 400 (pole wymagane, nie domyślnie puste)', async () => {
    const res = await POST(req({ enabled: true }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it('dokładnie 20 liczników przechodzi — limit techniczny jest granicą, nie ścianą', async () => {
    const res = await POST(
      req({ ...POPRAWNY, items: Array.from({ length: 20 }, (_, i) => licznik(`${i}`)) }),
    );
    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('poprawny zapis → 200 { ok: true, config } odczytany PO zapisie + wpis audytowy', async () => {
    load.mockResolvedValue({ enabled: false, items: [] } as never);
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, config: { enabled: false, items: [] } });
    expect(audit).toHaveBeenCalledWith(expect.any(Request), 'counters');
  });

  it('body nie będące JSON-em → 400 bez zapisu', async () => {
    const res = await POST(req('{nie-json'));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });
});

describe('GET /api/counters', () => {
  it('zwraca zapisany config bez pytania o limit', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(POPRAWNY);
    expect(gate).not.toHaveBeenCalled();
  });
});
