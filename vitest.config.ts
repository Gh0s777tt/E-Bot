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
      reporter: ['text-summary', 'json-summary'],
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
      // Progi = podłoga tuż pod obecnym baseline (po #693: stmts 34.2 / br 31.7 / fn 32.1 / ln 35.9),
      // żeby gate był zielony DZIŚ i chronił przed regresją w dół. Podnosić przy dokładaniu testów.
      // (Metryka liczy pliki DOTKNIĘTE testami — jakość pokrycia testowanej logiki, nie całego repo;
      //  przełączenie na `all:true` = osobna decyzja właściciela, bo urealniłoby baseline do ~15%.)
      thresholds: {
        statements: 34,
        branches: 31,
        functions: 32,
        lines: 35,
      },
    },
  },
});
