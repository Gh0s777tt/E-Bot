// Test kontraktowy trasy (audyt A-2, fala 5): druga trasa z bramką limitu planu, ale z dodatkowym
// wyróżnikiem — zapis NIE kończy się na bazie, tylko rejestruje komendy w Discordzie. Dlatego
// `saveCustomCommands` zwraca `{ ok, error, registered }`, a status odpowiedzi zależy od TEGO
// wyniku, nie od samego przejścia walidacji. Kontrakt pilnuje, żeby nieudana rejestracja była
// widoczna (400 + `error`), a nie zamiatana pod „ok: true".
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../lib/customCommands', () => ({
  getCustomCommands: vi.fn(),
  saveCustomCommands: vi.fn(),
}));
vi.mock('../../../lib/planLimits', () => ({ guardLimit: vi.fn() }));
vi.mock('../../../lib/audit', () => ({ recordAudit: vi.fn() }));

import { recordAudit } from '../../../lib/audit';
import { getCustomCommands, saveCustomCommands } from '../../../lib/customCommands';
import { guardLimit } from '../../../lib/planLimits';
import { GET, POST } from './route';

const load = vi.mocked(getCustomCommands);
const save = vi.mocked(saveCustomCommands);
const gate = vi.mocked(guardLimit);
const audit = vi.mocked(recordAudit);

const komenda = (name = 'powitanie') => ({
  name,
  description: 'Wita nowych',
  response: { content: 'Cześć!' },
});
const POPRAWNY = { commands: [komenda()] };

function req(body: unknown): Request {
  return new Request('https://panel.e-forge.test/api/custom-commands', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  load.mockResolvedValue([komenda()] as never);
  save.mockResolvedValue({ ok: true, registered: 1 } as never);
  gate.mockResolvedValue({ ok: true } as never);
  audit.mockResolvedValue(undefined as never);
});

describe('POST /api/custom-commands — wynik rejestracji w Discordzie', () => {
  it('udana rejestracja → 200 { ok: true, registered } + wpis audytowy', async () => {
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true, registered: 1 });
    expect(audit).toHaveBeenCalledWith(expect.any(Request), 'custom-commands');
  });

  it('NIEUDANA rejestracja → 400 z powodem, nie ciche „ok"', async () => {
    save.mockResolvedValue({ ok: false, error: 'Discord odrzucił: brak uprawnień' } as never);
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      error: 'Discord odrzucił: brak uprawnień',
    });
    // Komendy nie weszły do Discorda → nie ma zmiany do zapisania w dzienniku.
    expect(audit).not.toHaveBeenCalled();
  });

  it('odpowiedź zawsze niesie AKTUALNĄ listę komend — panel odświeża się z prawdy', async () => {
    load.mockResolvedValue([komenda('a'), komenda('b')] as never);
    const res = await POST(req(POPRAWNY));
    const body = (await res.json()) as { commands: unknown[] };
    expect(body.commands).toHaveLength(2);
  });
});

describe('POST /api/custom-commands — bramka limitu planu', () => {
  it('limit przekroczony → 403 i ZERO rejestracji w Discordzie', async () => {
    gate.mockResolvedValue({ ok: false, error: 'Plan Free: maks. 5 komend' } as never);
    const res = await POST(req({ commands: [komenda('a'), komenda('b')] }));
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'Plan Free: maks. 5 komend' });
    expect(save).not.toHaveBeenCalled();
    // Odbicie na limicie to nie zmiana configu — dziennik ma zostać czysty.
    expect(audit).not.toHaveBeenCalled();
  });

  it('bramka dostaje ILE BĘDZIE i ILE JEST', async () => {
    load.mockResolvedValue([komenda('a'), komenda('b')] as never);
    await POST(req({ commands: [komenda('a'), komenda('b'), komenda('c')] }));
    expect(gate).toHaveBeenCalledWith('customCommands', 3, 2);
  });

  it('złe body odpada PRZED bramką — limit nie jest nawet pytany', async () => {
    const res = await POST(req({ commands: [{ ...komenda(), name: 'WIELKIE LITERY' }] }));
    expect(res.status).toBe(400);
    expect(gate).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});

describe('POST /api/custom-commands — walidacja nazw i kształtu', () => {
  it.each([
    ['nazwa z wielkimi literami', { name: 'Powitanie' }],
    ['nazwa ze spacją', { name: 'moja komenda' }],
    ['nazwa pusta', { name: '' }],
    ['nazwa ponad 32 znaki', { name: 'a'.repeat(33) }],
    ['nazwa z polskim znakiem', { name: 'żółw' }],
    ['opis pusty', { description: '' }],
    ['opis ponad 100 znaków', { description: 'x'.repeat(101) }],
    ['nieznany typ komendy', { type: 'teleportacja' }],
    ['cooldown ponad dobę', { cooldownSec: 86_401 }],
    ['cooldown ujemny', { cooldownSec: -1 }],
  ])('%s → 400, zero zapisu i ZERO wpisu w audycie', async (_opis, patch) => {
    const res = await POST(req({ commands: [{ ...komenda(), ...patch }] }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
  });

  it('ponad 50 komend → 400 (cap techniczny poniżej limitu guild-komend Discorda)', async () => {
    const res = await POST(
      req({ commands: Array.from({ length: 51 }, (_, i) => komenda(`k${i}`)) }),
    );
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it('pola opcjonalne pominięte → zapisane jako domyślne, nie `undefined`', async () => {
    await POST(req(POPRAWNY));
    expect(save).toHaveBeenCalledWith([
      expect.objectContaining({
        ephemeral: false,
        options: [],
        type: 'message',
        randomLines: [],
        cooldownSec: 0,
      }),
    ]);
  });

  it('pusta lista komend przechodzi — to sposób na skasowanie wszystkich', async () => {
    const res = await POST(req({ commands: [] }));
    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledWith([]);
  });

  it('body nie będące JSON-em → 400 bez zapisu', async () => {
    const res = await POST(req('{nie-json'));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });
});

describe('GET /api/custom-commands', () => {
  it('zwraca listę pod kluczem `commands`, bez pytania o limit', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ commands: [komenda()] });
    expect(gate).not.toHaveBeenCalled();
  });
});
