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
      // podniosły pomiar do st 34.75 / br 32.41 / fn 32.36 / ln 36.46.
      // Fala 2 (2026-08-15): trasy globalne (ai-config + integrations, +28) → st 34.99 / br 32.62 /
      // fn 32.56 / ln 36.74.
      // Fala 3 (2026-08-15): configi bezpieczeństwa per-serwer (antinuke + automod, +28) →
      // st 35.10 / br 32.66 / fn 32.70 / ln 36.85.
      // Fala 4 (2026-08-15): ekonomia (economy + eco-season, +34) → st 35.20 / br 32.70 /
      // fn 32.85 / ln 36.95.
      // Fala 5 (2026-08-16): trasy z bramką limitu planu (counters + custom-commands, +37) →
      // st 35.35 / br 32.83 / fn 32.99 / ln 37.10.
      // Fala 6 (2026-08-16): antiraid + leveling (+44) → st 35.46 / br 32.87 / fn 33.13 / ln 37.20.
      // Audyt A-2 (2026-08-16): domknięcie `recordAudit` na trasach konfiguracyjnych (10 → 72) —
      // asercje audytu w 7 istniejących plikach testowych (+1 przypadek) → st 35.52 / br 32.89 /
      // fn 33.17 / ln 37.27. Progi za pomiarem, margines ~0.2 p.p.
      // Fala 7 (2026-08-16): trasy o najwyższej stawce uprawnieniowej — panel-staff (kto ma klucze
      // do panelu) i config/import (nadpisuje settings CAŁEJ instancji), +32 → st 35.73 / br 33.11 /
      // fn 33.29 / ln 37.48. Progi za pomiarem, margines ~0.2 p.p.
      thresholds: {
        statements: 35.5,
        branches: 32.9,
        functions: 33.1,
        lines: 37.28,
      },
    },
  },
});
