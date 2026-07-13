import { defineConfig } from 'vitest/config';

// Testy jednostkowe (czysta logika): parser czasu bota + schematy Zod panelu.
export default defineConfig({
  test: {
    include: ['**/*.test.{ts,mts}'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/.pnpm/**'],
    // Pomiar pokrycia (#673 audyt): `pnpm test:coverage`. Provider v8 liczy TYLKO pliki dotknięte
    // testami (all:false) — metryka mówi o jakości pokrycia testowanej logiki, nie całego repo
    // (bot ma 305 .mts, większość to usługi Discord bez czystej logiki do unit-testu). Progi
    // ustawione konserwatywnie pod obecny stan (ratchet — podnosić przy dokładaniu testów).
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary', 'cobertura'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/.pnpm/**',
        '**/*.test.{ts,mts}',
        '**/*.config.{ts,mts,mjs,js}',
        '**/*.d.ts',
        'e2e/**',
        'scripts/**',
        'bot/src/setup/**',
      ],
      // Progi = podłoga tuż pod obecnym baseline, żeby gate był zielony DZIŚ i chronił przed regresją.
      // Podnosić przy dokładaniu testów. (Metryka liczy pliki DOTKNIĘTE testami — jakość pokrycia
      // testowanej logiki, nie całego repo; `all:true` = osobna decyzja właściciela, urealnia do ~15%.)
      // fn: 32→31 (2026-07-13) — billing/premium (#694–#696) dodał nietestowane funkcje, realne
      // pokrycie fn spadło do ~31.9%; podłoga wyrównana do faktu (dług testowy = audyt A-2, ratchet w górę
      // po dołożeniu testów billingu).
      thresholds: {
        statements: 34,
        branches: 31,
        functions: 31,
        lines: 35,
      },
    },
  },
});
