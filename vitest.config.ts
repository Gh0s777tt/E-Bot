import { defineConfig } from 'vitest/config';

// Testy jednostkowe (czysta logika): parser czasu bota + schematy Zod panelu.
export default defineConfig({
  test: {
    include: ['**/*.test.{ts,mts}'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/.pnpm/**'],
  },
});
