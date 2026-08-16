// Test kontraktowy trasy (audyt A-2, fala 2): trasy GLOBALNE — config wspólny dla całej instancji,
// więc zapis musi być za bramką instance-admin. Kontrakt pilnuje trzech rzeczy: bramki (403),
// walidacji (400 z konkretnym powodem — panel pokazuje go użytkownikowi) i KOLEJNOŚCI: 403 leci
// zanim ktokolwiek dotknie body. Zamockowane są granice (rola, przechowalnia configu); schemat Zod
// idzie prawdziwy, bo walidacja JEST kontraktem tej trasy.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../lib/panelRoles', () => ({ isInstanceAdminRequest: vi.fn() }));
vi.mock('../../../lib/faza4', () => ({ getAiConfig: vi.fn(), saveAiConfig: vi.fn() }));
vi.mock('../../../lib/audit', () => ({ recordAudit: vi.fn() }));

import { recordAudit } from '../../../lib/audit';
import { getAiConfig, saveAiConfig } from '../../../lib/faza4';
import { isInstanceAdminRequest } from '../../../lib/panelRoles';
import { GET, POST } from './route';

const isAdmin = vi.mocked(isInstanceAdminRequest);
const load = vi.mocked(getAiConfig);
const save = vi.mocked(saveAiConfig);
const audit = vi.mocked(recordAudit);

const POPRAWNY = {
  enabled: true,
  model: 'deepseek',
  dailyRequestLimit: 500,
  dailyTokenLimit: 100_000,
};

function req(body: unknown): Request {
  return new Request('https://panel.e-forge.test/api/ai-config', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function bladZ(res: Response): Promise<string> {
  return ((await res.json()) as { error: string }).error;
}

beforeEach(() => {
  vi.clearAllMocks();
  isAdmin.mockResolvedValue(true);
  load.mockResolvedValue({ ...POPRAWNY, persona: '' } as never);
  save.mockResolvedValue(undefined as never);
  audit.mockResolvedValue(undefined as never);
});

describe('GET /api/ai-config — odczyt', () => {
  it('otwarty (bez sekretów) — UI tylko-do-odczytu ma działać dla każdego', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ model: 'deepseek' });
    expect(isAdmin).not.toHaveBeenCalled();
  });
});

describe('POST /api/ai-config — bramka instance-admin', () => {
  it('nie-admin → 403, zero zapisu do globalnego configu i ZERO wpisu w audycie', async () => {
    isAdmin.mockResolvedValue(false);
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(403);
    await expect(bladZ(res)).resolves.toBe('forbidden');
    expect(save).not.toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
  });

  it('bramka JEST PRZED walidacją — nie-admin ze złym body dostaje 403, nie 400', async () => {
    isAdmin.mockResolvedValue(false);
    const res = await POST(req({ zupelnie: 'nie to' }));
    expect(res.status).toBe(403);
    expect(save).not.toHaveBeenCalled();
  });

  it('admin z poprawnym body → 200 { ok: true, config }, zapis i wpis audytowy', async () => {
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      config: { ...POPRAWNY, persona: '' },
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(audit).toHaveBeenCalledWith(expect.any(Request), 'ai-config');
  });

  it('odpowiedź zwraca config ODCZYTANY PO zapisie, nie echo wejścia', async () => {
    load.mockResolvedValue({ ...POPRAWNY, persona: 'ze-storage' } as never);
    const res = await POST(req({ ...POPRAWNY, persona: 'z-wejscia' }));
    await expect(res.json()).resolves.toMatchObject({ config: { persona: 'ze-storage' } });
  });
});

describe('POST /api/ai-config — walidacja (400 z konkretnym powodem)', () => {
  it('nieznany model → 400 i komunikat wskazujący pole', async () => {
    const res = await POST(req({ ...POPRAWNY, model: 'gpt-5-turbo-ultra' }));
    expect(res.status).toBe(400);
    await expect(bladZ(res)).resolves.toContain('model');
    expect(save).not.toHaveBeenCalled();
  });

  it('brak wymaganego pola → 400', async () => {
    const { dailyTokenLimit: _pominiete, ...bezLimitu } = POPRAWNY;
    const res = await POST(req(bezLimitu));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it.each([
    ['ujemny limit żądań', { dailyRequestLimit: -1 }],
    ['limit żądań ponad sufit', { dailyRequestLimit: 10_001 }],
    ['limit tokenów ponad sufit', { dailyTokenLimit: 10_000_001 }],
    ['limit ułamkowy (nie int)', { dailyRequestLimit: 1.5 }],
  ])('%s → 400 (globalne limity kosztów nie przyjmują śmieci)', async (_opis, patch) => {
    const res = await POST(req({ ...POPRAWNY, ...patch }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
    // Audyt to dziennik REALNYCH zmian — odrzucone żądanie nie ma prawa go zaśmiecać.
    expect(audit).not.toHaveBeenCalled();
  });

  it('persona ponad 1000 znaków → 400', async () => {
    const res = await POST(req({ ...POPRAWNY, persona: 'a'.repeat(1001) }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it('brak persony → zapisana wartość domyślna (pusty string), nie undefined', async () => {
    await POST(req(POPRAWNY));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ persona: '' }));
  });

  it('body nie będące JSON-em → 400 z czytelnym powodem', async () => {
    const res = await POST(req('{nie-json'));
    expect(res.status).toBe(400);
    await expect(bladZ(res)).resolves.toContain('JSON');
    expect(save).not.toHaveBeenCalled();
  });
});
