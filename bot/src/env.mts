// Wczytuje sekrety z głównego .env repo (niezależnie od katalogu startowego).

import { existsSync } from 'node:fs';
import path from 'node:path';

export function loadEnv(): void {
  const candidates = [
    path.join(import.meta.dirname, '..', '..', '.env'), // bot/src -> repo/.env
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '..', '.env'),
  ];
  const found = candidates.find((p) => existsSync(p));
  if (found) process.loadEnvFile(found);
  else console.warn('[env] nie znaleziono .env w:', candidates.join(' | '));
}
