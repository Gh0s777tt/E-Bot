// Test kontraktowy trasy (audyt A-2, fala 6): anty-raid — trzeci i ostatni config bezpieczeństwa
// per-serwer (po `antinuke` i `automod` z fali 3). Stawka jest tu odwrotna niż w configach
// wygodowych: zbyt luźny próg przepuszcza raid, a zbyt ostry KICKUJE prawdziwych ludzi wchodzących
// na serwer. Dlatego kontrakt pilnuje granic progów i tego, że odrzucone wejście nie rusza ani
// zapisu, ani dziennika audytowego.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../lib/community', () => ({
  getAntiRaidConfig: vi.fn(),
  saveAntiRaidConfig: vi.fn(),
}));
vi.mock('../../../lib/audit', () => ({ recordAudit: vi.fn() }));

import { recordAudit } from '../../../lib/audit';
import { getAntiRaidConfig, saveAntiRaidConfig } from '../../../lib/community';
import { GET, POST } from './route';

const load = vi.mocked(getAntiRaidConfig);
const save = vi.mocked(saveAntiRaidConfig);
const audit = vi.mocked(recordAudit);

const POPRAWNY = {
  enabled: true,
  joinCount: 10,
  windowSec: 30,
  action: 'kick',
  alertChannelId: '123',
  minAccountAgeDays: 7,
};

function req(body: unknown): Request {
  return new Request('https://panel.e-forge.test/api/antiraid', {
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

describe('POST /api/antiraid — ścieżka zapisu', () => {
  it('poprawny config → 200 { ok: true, config } + zapis + wpis audytowy', async () => {
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, config: POPRAWNY });
    expect(save).toHaveBeenCalledTimes(1);
    expect(audit).toHaveBeenCalledWith(expect.any(Request), 'antiraid');
  });

  it('opcjonalne ustawienia alt-detekcji dostają bezpieczne domyślne, nie `undefined`', async () => {
    await POST(req(POPRAWNY));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        altDetect: false, // wykrywanie multikont domyślnie WYŁĄCZONE — samo w sobie karze ludzi
        altMinAgeDays: 7,
        altNoAvatar: true,
        altAction: 'alert', // najłagodniejsza akcja jako domyślna
        autoLockdown: false,
      }),
    );
  });

  it('odpowiedź zwraca config ODCZYTANY PO zapisie, nie echo wejścia', async () => {
    load.mockResolvedValue({ ...POPRAWNY, joinCount: 99 } as never);
    const res = await POST(req({ ...POPRAWNY, joinCount: 10 }));
    await expect(res.json()).resolves.toMatchObject({ config: { joinCount: 99 } });
  });
});

describe('POST /api/antiraid — granice progów wykrywania', () => {
  it.each([
    // Próg 1 wejścia = raid przy KAŻDYM dołączeniu; schemat wymaga minimum 2.
    ['próg 1 wejścia (minimum to 2)', { joinCount: 1 }],
    ['próg ponad 100 wejść', { joinCount: 101 }],
    ['okno 0 sekund', { windowSec: 0 }],
    ['okno ponad 5 minut', { windowSec: 301 }],
    ['nieznana akcja', { action: 'rozstrzelanie' }],
    ['ujemny wiek konta', { minAccountAgeDays: -1 }],
    ['wiek konta ponad rok', { minAccountAgeDays: 366 }],
    ['nieznana akcja alt-detekcji', { altDetect: true, altAction: 'zbanuj_wszystkich' }],
    ['nieznana akcja honeypota', { honeypot: { enabled: true, channelId: '1', action: 'nuke' } }],
  ])('%s → 400, zero zapisu i ZERO wpisu w audycie', async (_opis, patch) => {
    const res = await POST(req({ ...POPRAWNY, ...patch }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
  });

  it('wartości brzegowe progu (2 wejścia / 1 s / 365 dni) przechodzą — granica jest inkluzywna', async () => {
    const res = await POST(
      req({ ...POPRAWNY, joinCount: 2, windowSec: 1, minAccountAgeDays: 365 }),
    );
    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it.each(['kick', 'ban', 'timeout'])('akcja „%s" przechodzi do zapisu', async (action) => {
    await POST(req({ ...POPRAWNY, action }));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ action }));
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

describe('GET /api/antiraid', () => {
  it('zwraca zapisany config bez wpisu w audycie (odczyt to nie zmiana)', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(POPRAWNY);
    expect(audit).not.toHaveBeenCalled();
  });
});
