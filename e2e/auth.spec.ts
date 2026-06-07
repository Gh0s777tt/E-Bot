import { expect, test } from '@playwright/test';

// Bramka proxy (proxy.ts): trasy panelu wymagają sesji → redirect na /login.
// Strona /login jest otwarta i renderuje markę + przycisk OAuth Discord.
test.describe('Bramka logowania (proxy)', () => {
  test('niezalogowany na trasie panelu → redirect na /login', async ({ page }) => {
    await page.goto('/modules');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('link', { name: /Zaloguj przez Discord/i })).toBeVisible();
  });

  test('/login renderuje markę i przycisk logowania Discord', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /E-?BOT/i })).toBeVisible();
    const loginLink = page.getByRole('link', { name: /Zaloguj przez Discord/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/api/auth/login');
  });
});
