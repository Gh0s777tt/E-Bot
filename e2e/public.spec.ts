import { expect, test } from '@playwright/test';

// Tor M — publiczne strony /p/* (proxy otwarte, bez logowania). Dane przez lib/public.ts są
// defensywne (!hasSupabase / try-catch → []), więc szkielet renderuje się w każdym stanie.
test.describe('Publiczne strony /p/ (bez logowania)', () => {
  test('/p/leaderboard renderuje szkielet rankingu', async ({ page }) => {
    await page.goto('/p/leaderboard');
    await expect(page.getByRole('heading', { name: /Ranking serwera/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Top XP/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Top ekonomia/i })).toBeVisible();
  });

  test('/p/u/[id] renderuje szkielet profilu (bez crasha dla nieznanego id)', async ({ page }) => {
    const resp = await page.goto('/p/u/000000000000000000');
    expect(resp?.status() ?? 500).toBeLessThan(500); // nieznany id → brak crasha 5xx
    await expect(page.getByRole('heading').first()).toBeVisible(); // nagłówek renderuje się (locale-agnostic)
  });
});
