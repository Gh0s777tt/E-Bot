import { expect, test } from '@playwright/test';

// Publiczny healthcheck (proxy: /api/health otwarte). Defensywny: 200 gdy heartbeat świeży,
// 503 gdy brak/stary. Asercja na KSZTAŁT odpowiedzi, nie na status — zielone w obu stanach.
test.describe('API zdrowia', () => {
  test('GET /api/health zwraca JSON ze statusem bota', async ({ request }) => {
    const res = await request.get('/api/health');
    expect([200, 503]).toContain(res.status());
    const body = (await res.json()) as { ok: boolean; online: boolean | null };
    expect(typeof body.ok).toBe('boolean');
    expect(body).toHaveProperty('online');
  });
});
