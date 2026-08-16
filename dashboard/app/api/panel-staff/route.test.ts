// Test kontraktowy trasy (audyt A-2, fala 7): uprawnienia do panelu. To trasa, na której błąd nie
// psuje danych — tylko oddaje komuś klucze. Stąd nacisk na bramkę: `panel_staff` decyduje, KTO jest
// adminem/edytorem/widzem panelu, więc jej zapis wymaga admina INSTANCJI, a nie samej roli z sesji.
// Gdyby wystarczyła rola sesji, tenant-admin self-serve (`role: 'admin'`) mógłby dopisać się do
// staffu i przejąć instancję — dlatego bramka jest tu testowana także na ODCZYCIE, co odróżnia tę
// trasę od zwykłych configów.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../lib/panelRoles', () => ({
  isInstanceAdminRequest: vi.fn(),
  getStaff: vi.fn(),
  saveStaff: vi.fn(),
}));
vi.mock('../../../lib/audit', () => ({ recordAudit: vi.fn() }));

import { recordAudit } from '../../../lib/audit';
import { getStaff, isInstanceAdminRequest, saveStaff } from '../../../lib/panelRoles';
import { GET, POST } from './route';

const gate = vi.mocked(isInstanceAdminRequest);
const load = vi.mocked(getStaff);
const save = vi.mocked(saveStaff);
const audit = vi.mocked(recordAudit);

const OSOBA = { uid: '123456789012345678', label: 'Moderator', role: 'editor' };
const POPRAWNY = { staff: [OSOBA] };

function req(body?: unknown): Request {
  return new Request('https://panel.e-forge.test/api/panel-staff', {
    method: 'POST',
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  gate.mockResolvedValue(true);
  load.mockResolvedValue([OSOBA] as never);
  save.mockResolvedValue(undefined as never);
  audit.mockResolvedValue(undefined as never);
});

describe('POST /api/panel-staff — bramka admina instancji', () => {
  it('bez uprawnień instancji → 403 i ZERO zapisu (nie da się dopisać do staffu)', async () => {
    gate.mockResolvedValue(false);
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(403);
    expect(save).not.toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
  });

  it('bramka jest pytana PRZED odczytem body — brak uprawnień nie kosztuje parsowania', async () => {
    gate.mockResolvedValue(false);
    await POST(req('{nie-json'));
    expect(gate).toHaveBeenCalledTimes(1);
    expect(save).not.toHaveBeenCalled();
  });

  it('z uprawnieniami → 200 { ok: true, staff } + zapis + wpis audytowy', async () => {
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, staff: [OSOBA] });
    expect(save).toHaveBeenCalledTimes(1);
    expect(audit).toHaveBeenCalledWith(expect.any(Request), 'panel-staff');
  });

  it('odpowiedź zwraca staff ODCZYTANY PO zapisie, nie echo wejścia', async () => {
    load.mockResolvedValue([{ ...OSOBA, role: 'viewer' }] as never);
    const res = await POST(req(POPRAWNY));
    await expect(res.json()).resolves.toMatchObject({ staff: [{ role: 'viewer' }] });
  });
});

describe('POST /api/panel-staff — walidacja wpisów', () => {
  it.each([
    ['nieznana rola', { role: 'superadmin' }],
    ['rola pusta', { role: '' }],
    ['id za krótkie (nie Discord ID)', { uid: '123' }],
    ['id z literami', { uid: 'abcdefghijklmnopqr' }],
    ['id ponad 25 cyfr', { uid: '1'.repeat(26) }],
    ['etykieta ponad 60 znaków', { label: 'x'.repeat(61) }],
  ])('%s → 400, zero zapisu i zero wpisu w audycie', async (_opis, patch) => {
    const res = await POST(req({ staff: [{ ...OSOBA, ...patch }] }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
  });

  it.each(['admin', 'editor', 'viewer'])('rola „%s" przechodzi do zapisu', async (role) => {
    await POST(req({ staff: [{ ...OSOBA, role }] }));
    expect(save).toHaveBeenCalledWith([expect.objectContaining({ role })]);
  });

  it('ponad 50 osób → 400 (cap listy)', async () => {
    const duzo = Array.from({ length: 51 }, (_, i) => ({
      ...OSOBA,
      uid: `${100000000000000000 + i}`,
    }));
    const res = await POST(req({ staff: duzo }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it('pusta lista przechodzi — to sposób na odebranie dostępu wszystkim', async () => {
    const res = await POST(req({ staff: [] }));
    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledWith([]);
  });

  it('body nie będące JSON-em → 400 bez zapisu', async () => {
    const res = await POST(req('{nie-json'));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });
});

describe('GET /api/panel-staff', () => {
  // Wyróżnik tej trasy: ODCZYT też jest za bramką. Lista staffu to mapa tego, kogo warto zaatakować,
  // więc nie jest publiczna nawet dla zalogowanego tenant-admina.
  it('bez uprawnień instancji → 403, lista NIE wycieka', async () => {
    gate.mockResolvedValue(false);
    const res = await GET(req());
    expect(res.status).toBe(403);
    expect(load).not.toHaveBeenCalled();
  });

  it('z uprawnieniami → 200 z listą, bez wpisu w audycie (odczyt to nie zmiana)', async () => {
    const res = await GET(req());
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ staff: [OSOBA] });
    expect(audit).not.toHaveBeenCalled();
  });
});
