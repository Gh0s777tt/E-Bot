// Test kontraktowy trasy (audyt A-2, fala 3): trasy KONFIGURACYJNE per-serwer. Autoryzację robi
// middleware (`proxy.ts`), więc kontraktem samej trasy jest: walidacja → zapis → wpis audytowy →
// odpowiedź z ODCZYTU. Anti-nuke wybrany na pierwszy, bo to config bezpieczeństwa — przepuszczony
// śmieć nie wywala aplikacji, tylko po cichu rozbraja ochronę serwera.
// Wzorzec z tego pliku powiela się na resztę tras `parseBody → zapis → recordAudit`.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../lib/data', () => ({ getAntinuke: vi.fn(), saveAntinuke: vi.fn() }));
vi.mock('../../../lib/audit', () => ({ recordAudit: vi.fn() }));

import { recordAudit } from '../../../lib/audit';
import { getAntinuke, saveAntinuke } from '../../../lib/data';
import { GET, POST } from './route';

const load = vi.mocked(getAntinuke);
const save = vi.mocked(saveAntinuke);
const audit = vi.mocked(recordAudit);

const POPRAWNY = {
  enabled: true,
  logChannelId: '123',
  punishment: 'ban',
  quarantineRoleId: '456',
  whitelistUsers: ['1'],
  whitelistRoles: ['2'],
  protections: { massBan: { enabled: true, count: 3, windowSec: 60 } },
};

function req(body: unknown): Request {
  return new Request('https://panel.e-forge.test/api/antinuke', {
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
  audit.mockResolvedValue(undefined as never);
});

describe('POST /api/antinuke — ścieżka zapisu', () => {
  it('poprawny config → 200 { ok: true, config } + zapis + wpis audytowy', async () => {
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, config: POPRAWNY });
    expect(save).toHaveBeenCalledTimes(1);
    expect(audit).toHaveBeenCalledWith(expect.any(Request), 'antinuke');
  });

  it('odpowiedź zwraca config ODCZYTANY PO zapisie, nie echo wejścia', async () => {
    load.mockResolvedValue({ ...POPRAWNY, logChannelId: 'ze-storage' } as never);
    const res = await POST(req({ ...POPRAWNY, logChannelId: 'z-wejscia' }));
    await expect(res.json()).resolves.toMatchObject({ config: { logChannelId: 'ze-storage' } });
  });

  it('nieznane pola są obcinane — do configu nie trafia nic spoza schematu', async () => {
    await POST(req({ ...POPRAWNY, backdoor: true }));
    expect(save).toHaveBeenCalledWith(expect.not.objectContaining({ backdoor: expect.anything() }));
  });
});

describe('POST /api/antinuke — odrzucone wejście nie rusza niczego', () => {
  it.each([
    ['nieznana kara', { punishment: 'rozstrzelanie' }],
    ['enabled nie-boolowskie', { enabled: 'tak' }],
    [
      'próg ochrony poniżej 1',
      { protections: { massBan: { enabled: true, count: 0, windowSec: 60 } } },
    ],
    [
      'okno ponad dobę',
      { protections: { massBan: { enabled: true, count: 3, windowSec: 86_401 } } },
    ],
    ['ochrona bez `count`', { protections: { massBan: { enabled: true, windowSec: 60 } } }],
    [
      'whitelist ponad 500 pozycji',
      { whitelistUsers: Array.from({ length: 501 }, (_, i) => `${i}`) },
    ],
    ['id kanału ponad 40 znaków', { logChannelId: '1'.repeat(41) }],
  ])('%s → 400, zero zapisu i ZERO wpisu w audycie', async (_opis, patch) => {
    const res = await POST(req({ ...POPRAWNY, ...patch }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
    // Audyt to dziennik REALNYCH zmian — odrzucone żądanie nie ma prawa go zaśmiecać.
    expect(audit).not.toHaveBeenCalled();
  });

  it('błąd walidacji wskazuje POLE — panel pokazuje go użytkownikowi', async () => {
    const res = await POST(req({ ...POPRAWNY, punishment: 'rozstrzelanie' }));
    await expect(bladZ(res)).resolves.toContain('punishment');
  });

  it('body nie będące JSON-em → 400 z czytelnym powodem', async () => {
    const res = await POST(req('{nie-json'));
    expect(res.status).toBe(400);
    await expect(bladZ(res)).resolves.toContain('JSON');
    expect(save).not.toHaveBeenCalled();
  });

  it('puste body → 400 (brak wymaganych pól), a nie zapis samych domyślnych', async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });
});

describe('GET /api/antinuke', () => {
  it('zwraca zapisany config bez wpisu w audycie (odczyt to nie zmiana)', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(POPRAWNY);
    expect(audit).not.toHaveBeenCalled();
  });
});
