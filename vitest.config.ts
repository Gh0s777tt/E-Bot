import { defineConfig } from 'vitest/config';

// Testy jednostkowe (czysta logika): parser czasu bota + schematy Zod panelu.
export default defineConfig({
  test: {
    include: ['**/*.test.{ts,mts}'],
    // `**/._*` — AppleDouble: na woluminach nie-HFS macOS zapisuje resource fork obok pliku, więc
    // obok `route.test.ts` powstaje `._route.test.ts`, które `include` łapie jako test i wywala
    // przebieg na PARSE_ERROR. W CI (świeży klon) ich nie ma — to ochrona lokalnych `pnpm test`.
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/.pnpm/**', '**/._*'],
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
      // Audyt 2026-08 (#5): podłoga leżała PONIŻEJ baseline'u (i fn był ratchetowany w dół) — gate
      // nie łapał regresji. Zmierzone `pnpm test:coverage` 2026-08-12: st 34.38 / br 31.86 /
      // fn 32.29 / ln 36.08 → progi podniesione tuż pod pomiar (margines ~0.2 p.p. na szum
      // z równoległych zmian). Zasada: progów NIE obniżamy — dokładamy testy.
      // Audyt A-2, fala 1 (2026-08-15): testy kontraktowe billingu (checkout + webhook, +34)
      // podniosły pomiar do st 34.75 / br 32.41 / fn 32.36 / ln 36.46 → progi za nim, z tym samym
      // marginesem ~0.2 p.p. co poprzednio.
      thresholds: {
        statements: 34.5,
        branches: 32.2,
        functions: 32.15,
        lines: 36.25,
      },
    },
  },
});
