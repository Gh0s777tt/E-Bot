import { defineConfig, devices } from '@playwright/test';

// E2E panelu (Next 16). Cele odporne na stan danych — asercje na SZKIELET stron, nie na rekordy,
// więc zielone niezależnie od Supabase (dane / pusto / down / CI bez env — wszystkie defensywne).
// Vitest łapie tylko *.test.* → te *.spec.ts z nim nie kolidują.

// Dedykowany port (3001 bywa zajęty przez lokalny `pnpm dev`).
const PORT = Number(process.env.E2E_PORT ?? 3101);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  // Jeden dev-server kompiluje trasy on-demand (Turbopack) — seryjnie, by uniknąć thrashingu/flaków.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    navigationTimeout: 45_000,
    actionTimeout: 15_000,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Domyślnie cold-start `next dev` (szybki iteracyjnie). `pnpm exec` pewnie rozwiązuje `next`
    // w workspace (node-linker=hoisted). Playwright czeka na gotowość portu.
    // E2E_PROD=1 → build produkcyjny: prekompilowane trasy znoszą latencję Turbopacka on-demand,
    // przez którą ciężkie strony /p/* potrafią nie zmieścić się w 10 s asercji na zimnej maszynie
    // (lokalnie zalecane do stabilnego pełnego przebiegu; CI/dev domyślnie zostają na `next dev`).
    command: process.env.E2E_PROD
      ? `pnpm exec next build && pnpm exec next start -p ${PORT}`
      : `pnpm exec next dev -p ${PORT}`,
    cwd: 'dashboard',
    url: BASE_URL,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
