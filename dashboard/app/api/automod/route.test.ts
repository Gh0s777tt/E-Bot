// Test kontraktowy trasy (audyt A-2, fala 3): drugi config bezpieczeństwa per-serwer. Automod ma
// tu wyróżnik — `bannedRegex` to wzorce KOMPILOWANE przez bota i uruchamiane na KAŻDEJ wiadomości,
// więc limity długości i liczby z schematu są realną barierą kosztu, nie kosmetyką. (Sam guard
// ReDoS siedzi w bocie — `isUnsafeRegexPattern`, #622 — i ma własne testy.)
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../lib/community', () => ({
  getAutomodConfig: vi.fn(),
  saveAutomodConfig: vi.fn(),
}));
vi.mock('../../../lib/audit', () => ({ recordAudit: vi.fn() }));

import { recordAudit } from '../../../lib/audit';
import { getAutomodConfig, saveAutomodConfig } from '../../../lib/community';
import { GET, POST } from './route';

const load = vi.mocked(getAutomodConfig);
const save = vi.mocked(saveAutomodConfig);
const audit = vi.mocked(recordAudit);

const POPRAWNY = {
  enabled: true,
  blockInvites: true,
  blockLinks: false,
  maxMentions: 5,
  antiSpamCount: 5,
  antiSpamSec: 10,
  modlogChannelId: '123',
  exemptRoleId: '456',
};

function req(body: unknown): Request {
  return new Request('https://panel.e-forge.test/api/automod', {
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

describe('POST /api/automod — ścieżka zapisu', () => {
  it('poprawny config → 200 { ok: true, config } + zapis + wpis audytowy', async () => {
    const res = await POST(req(POPRAWNY));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, config: POPRAWNY });
    expect(save).toHaveBeenCalledTimes(1);
    expect(audit).toHaveBeenCalledWith(expect.any(Request), 'automod');
  });

  it('listy pominięte w body zapisują się jako puste tablice, nie `undefined`', async () => {
    await POST(req(POPRAWNY));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        bannedWords: [],
        bannedRegex: [],
        allowedLinks: [],
        ignoreChannels: [],
      }),
    );
  });

  it('odpowiedź zwraca config ODCZYTANY PO zapisie, nie echo wejścia', async () => {
    load.mockResolvedValue({ ...POPRAWNY, maxMentions: 42 } as never);
    const res = await POST(req({ ...POPRAWNY, maxMentions: 5 }));
    await expect(res.json()).resolves.toMatchObject({ config: { maxMentions: 42 } });
  });
});

describe('POST /api/automod — limity chroniące koszt skanowania wiadomości', () => {
  it.each([
    ['ponad 20 wzorców regex', { bannedRegex: Array.from({ length: 21 }, () => 'spam') }],
    ['wzorzec dłuższy niż 200 znaków', { bannedRegex: ['a'.repeat(201)] }],
    ['pusty wzorzec', { bannedRegex: [''] }],
    ['ponad 300 zakazanych słów', { bannedWords: Array.from({ length: 301 }, (_, i) => `s${i}`) }],
    ['maxMentions ponad 50', { maxMentions: 51 }],
    ['antiSpamSec równy 0 (dzielenie okna)', { antiSpamSec: 0 }],
    ['antiSpamSec ponad 60', { antiSpamSec: 61 }],
    ['ponad 50 ignorowanych kanałów', { ignoreChannels: Array.from({ length: 51 }, () => '1') }],
  ])('%s → 400, zero zapisu i zero wpisu w audycie', async (_opis, patch) => {
    const res = await POST(req({ ...POPRAWNY, ...patch }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
  });

  it('dokładnie 20 wzorców i 300 słów przechodzi — limit jest górną granicą, nie ścianą', async () => {
    const res = await POST(
      req({
        ...POPRAWNY,
        bannedRegex: Array.from({ length: 20 }, () => 'spam'),
        bannedWords: Array.from({ length: 300 }, (_, i) => `s${i}`),
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
});

describe('GET /api/automod', () => {
  it('zwraca zapisany config bez wpisu w audycie (odczyt to nie zmiana)', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(POPRAWNY);
    expect(audit).not.toHaveBeenCalled();
  });
});
