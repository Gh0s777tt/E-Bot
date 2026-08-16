// Test kontraktowy trasy (audyt A-2, fala 2): drugi config GLOBALNY — dostawca/model AI + flagi
// integracji wspólne dla całej instancji. Poza bramką instance-admin kontrakt pilnuje tu rzeczy,
// której `ai-config` nie ma: schemat obcina NIEZNANE pola i domyka braki wartościami domyślnymi,
// więc do przechowalni nie trafia ani śmieć, ani `undefined`.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../lib/panelRoles', () => ({ isInstanceAdminRequest: vi.fn() }));
vi.mock('../../../lib/integrations', () => ({
  getIntegrationConfig: vi.fn(),
  saveIntegrationConfig: vi.fn(),
}));
vi.mock('../../../lib/audit', () => ({ recordAudit: vi.fn() }));

import { recordAudit } from '../../../lib/audit';
import { getIntegrationConfig, saveIntegrationConfig } from '../../../lib/integrations';
import { isInstanceAdminRequest } from '../../../lib/panelRoles';
import { GET, POST } from './route';

const isAdmin = vi.mocked(isInstanceAdminRequest);
const load = vi.mocked(getIntegrationConfig);
const save = vi.mocked(saveIntegrationConfig);
const audit = vi.mocked(recordAudit);

const ZAPISANY = { enabled: { twitch: true }, aiProvider: 'deepseek', aiModel: 'deepseek-chat' };

function req(body: unknown): Request {
  return new Request('https://panel.e-forge.test/api/integrations', {
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
  load.mockResolvedValue(ZAPISANY as never);
  save.mockResolvedValue(undefined as never);
  audit.mockResolvedValue(undefined as never);
});

describe('GET /api/integrations — odczyt', () => {
  it('otwarty — sekrety siedzą w env, nie w tym configu', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(ZAPISANY);
    expect(isAdmin).not.toHaveBeenCalled();
  });
});

describe('POST /api/integrations — bramka instance-admin', () => {
  it('nie-admin → 403 i zero zapisu (tenant-admin nie nadpisze ustawień instancji)', async () => {
    isAdmin.mockResolvedValue(false);
    const res = await POST(req(ZAPISANY));
    expect(res.status).toBe(403);
    await expect(bladZ(res)).resolves.toBe('forbidden');
    expect(save).not.toHaveBeenCalled();
  });

  it('bramka JEST PRZED parsowaniem body — nie-admin ze śmieciem dostaje 403, nie 400', async () => {
    isAdmin.mockResolvedValue(false);
    const res = await POST(req('{nie-json'));
    expect(res.status).toBe(403);
    expect(save).not.toHaveBeenCalled();
  });

  it('admin z poprawnym body → 200 { ok: true, config } + wpis audytowy', async () => {
    const res = await POST(req(ZAPISANY));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, config: ZAPISANY });
    expect(save).toHaveBeenCalledTimes(1);
    expect(audit).toHaveBeenCalledWith(expect.any(Request), 'integrations');
  });

  it('403 nie-admina nie zostawia śladu w audycie — to nie była zmiana', async () => {
    isAdmin.mockResolvedValue(false);
    await POST(req(ZAPISANY));
    expect(audit).not.toHaveBeenCalled();
  });
});

describe('POST /api/integrations — kształt zapisu', () => {
  it('nieznane pola są OBCINANE, nie zapisywane do globalnego configu', async () => {
    await POST(req({ ...ZAPISANY, wstrzykniete: 'zlo', __proto__: { admin: true } }));
    expect(save).toHaveBeenCalledWith({
      enabled: { twitch: true },
      aiProvider: 'deepseek',
      aiModel: 'deepseek-chat',
    });
  });

  it('puste body → wartości domyślne, do przechowalni nie leci `undefined`', async () => {
    await POST(req({}));
    expect(save).toHaveBeenCalledWith({ enabled: {}, aiProvider: '', aiModel: '' });
  });

  it('odpowiedź zwraca config ODCZYTANY PO zapisie, nie echo wejścia', async () => {
    load.mockResolvedValue({ ...ZAPISANY, aiModel: 'ze-storage' } as never);
    const res = await POST(req({ ...ZAPISANY, aiModel: 'z-wejscia' }));
    await expect(res.json()).resolves.toMatchObject({ config: { aiModel: 'ze-storage' } });
  });
});

describe('POST /api/integrations — walidacja i błędy', () => {
  it.each([
    ['flaga nie-boolowska', { enabled: { twitch: 'tak' } }],
    ['`enabled` nie będące obiektem', { enabled: 'wszystko' }],
    ['klucz flagi ponad 64 znaki', { enabled: { ['a'.repeat(65)]: true } }],
    ['aiProvider ponad 32 znaki', { aiProvider: 'a'.repeat(33) }],
    ['aiModel ponad 120 znaków', { aiModel: 'a'.repeat(121) }],
  ])('%s → 400 invalid_body, zero zapisu i ZERO wpisu w audycie', async (_opis, patch) => {
    const res = await POST(req({ ...ZAPISANY, ...patch }));
    expect(res.status).toBe(400);
    await expect(bladZ(res)).resolves.toBe('invalid_body');
    expect(save).not.toHaveBeenCalled();
    // Audyt to dziennik REALNYCH zmian — odrzucone żądanie nie ma prawa go zaśmiecać.
    expect(audit).not.toHaveBeenCalled();
  });

  it('body nie będące JSON-em → 400 (bez 500 — wyjątek złapany)', async () => {
    const res = await POST(req('{nie-json'));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it('padnięcie przechowalni → 400 z powodem, nie niezłapane 500', async () => {
    save.mockRejectedValue(new Error('supabase nie odpowiada'));
    const res = await POST(req(ZAPISANY));
    expect(res.status).toBe(400);
    await expect(bladZ(res)).resolves.toBe('supabase nie odpowiada');
    // Zapis padł → nie ma czego audytować; wpis powstaje PO udanym zapisie.
    expect(audit).not.toHaveBeenCalled();
  });
});
