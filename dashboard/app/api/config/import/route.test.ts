// Test kontraktowy trasy (audyt A-2, fala 7): przywracanie konfiguracji z kopii. Najbardziej
// destrukcyjna trasa globalna w panelu — jednym żądaniem nadpisuje klucze `settings` CAŁEJ
// instancji, czyli config wszystkich serwerów naraz. Kontrakt pilnuje trzech barier w kolejności:
// uprawnienia admina INSTANCJI → limit rozmiaru → kształt danych. Każda z nich broni przed czymś
// innym, więc każda ma tu swój przypadek.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../lib/panelRoles', () => ({ isInstanceAdminRequest: vi.fn() }));
vi.mock('../../../../lib/data', () => ({ restoreSettings: vi.fn() }));

import { restoreSettings } from '../../../../lib/data';
import { isInstanceAdminRequest } from '../../../../lib/panelRoles';
import { POST } from './route';

const gate = vi.mocked(isInstanceAdminRequest);
const restore = vi.mocked(restoreSettings);

const MAX_BODY = 1_000_000;

function req(body: string): Request {
  return new Request('https://panel.e-forge.test/api/config/import', { method: 'POST', body });
}

beforeEach(() => {
  vi.clearAllMocks();
  gate.mockResolvedValue(true);
  restore.mockResolvedValue(3 as never);
});

describe('POST /api/config/import — bramka uprawnień', () => {
  it('bez admina instancji → 403 i ZERO przywracania', async () => {
    gate.mockResolvedValue(false);
    const res = await POST(req(JSON.stringify({ settings: { a: 1 } })));
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: 'brak uprawnień (admin instancji)',
    });
    expect(restore).not.toHaveBeenCalled();
  });

  // Tenant-admin self-serve ma `role: 'admin'` w SWOIM portalu, ale nie jest adminem instancji.
  // Ta trasa nadpisuje config wszystkich serwerów, więc sama rola z sesji nie może wystarczyć.
  it('bramka jest sprawdzana PRZED czytaniem body (odmowa nie kosztuje wczytania pliku)', async () => {
    gate.mockResolvedValue(false);
    await POST(req('x'.repeat(MAX_BODY + 10)));
    expect(gate).toHaveBeenCalledTimes(1);
    expect(restore).not.toHaveBeenCalled();
  });
});

describe('POST /api/config/import — limit rozmiaru', () => {
  it('plik ponad 1 MB → 413 bez przywracania', async () => {
    const res = await POST(req('x'.repeat(MAX_BODY + 1)));
    expect(res.status).toBe(413);
    await expect(res.json()).resolves.toMatchObject({ ok: false });
    expect(restore).not.toHaveBeenCalled();
  });

  it('dokładnie 1 MB przechodzi limit — granica jest inkluzywna', async () => {
    // Wypełniacz w polu tekstowym, żeby trafić dokładnie w MAX_BODY przy poprawnym JSON-ie.
    const otoczka = JSON.stringify({ settings: { k: '' } });
    const wypelniacz = 'x'.repeat(MAX_BODY - otoczka.length);
    const res = await POST(req(JSON.stringify({ settings: { k: wypelniacz } })));
    expect(res.status).not.toBe(413);
  });
});

describe('POST /api/config/import — kształt danych', () => {
  it('akceptuje pełną kopię { settings: {...} }', async () => {
    const res = await POST(req(JSON.stringify({ settings: { automod: { enabled: true } } })));
    expect(res.status).toBe(200);
    expect(restore).toHaveBeenCalledWith({ automod: { enabled: true } });
    await expect(res.json()).resolves.toEqual({ ok: true, count: 3 });
  });

  it('akceptuje też sam obiekt kluczy (kopia bez otoczki)', async () => {
    const res = await POST(req(JSON.stringify({ automod: { enabled: true } })));
    expect(res.status).toBe(200);
    expect(restore).toHaveBeenCalledWith({ automod: { enabled: true } });
  });

  it.each([
    ['tablica zamiast obiektu', '[1,2,3]'],
    ['tablica pod kluczem settings', '{"settings":[1,2]}'],
    ['null', 'null'],
    ['liczba', '42'],
    ['tekst', '"cokolwiek"'],
  ])('%s → 400 bez przywracania', async (_opis, body) => {
    const res = await POST(req(body));
    expect(res.status).toBe(400);
    expect(restore).not.toHaveBeenCalled();
  });

  it('nieprawidłowy JSON → 400 z jasnym powodem', async () => {
    const res = await POST(req('{nie-json'));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'nieprawidłowy JSON' });
    expect(restore).not.toHaveBeenCalled();
  });

  it('pusty obiekt przechodzi — kopia bez kluczy nie jest błędem', async () => {
    const res = await POST(req('{}'));
    expect(res.status).toBe(200);
    expect(restore).toHaveBeenCalledWith({});
  });

  it('zwraca LICZBĘ przywróconych kluczy, nie samo „ok" — panel pokazuje ją użytkownikowi', async () => {
    restore.mockResolvedValue(17 as never);
    const res = await POST(req(JSON.stringify({ settings: { a: 1 } })));
    await expect(res.json()).resolves.toEqual({ ok: true, count: 17 });
  });
});
