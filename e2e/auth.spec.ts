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
    // Marka „E-BOT" to znak graficzny w <span> (LoginSplit), NIE nagłówek — nagłówki tego ekranu
    // biorą się z i18n (`login.brandTitle` + `cta.login`), więc szukanie w nich marki nigdy nie
    // trafi. Ekran ma dwa znaki marki (panel desktopowy `lg:flex` + blok mobilny `lg:hidden`),
    // dlatego liczymy tylko widoczny — asercja jest wtedy niezależna od szerokości viewportu.
    await expect(page.getByText(/E-\s*BOT/).filter({ visible: true })).toHaveCount(1);
    // Tytuł formularza (h1) — sama widoczność, bez treści: jest tłumaczony na 14 języków.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const loginLink = page.getByRole('link', { name: /Zaloguj przez Discord/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/api/auth/login');
  });
});
