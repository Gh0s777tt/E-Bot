// Wspólne uwierzytelnienie mostu bot→panel (service-to-service). Jedno miejsce do audytu dla
// wszystkich tras `/api/internal/*` wołanych przez bota. Model zaufania: bot↔panel, oba first-party,
// po HTTPS, ze współdzielonym sekretem `PLUGIN_BRIDGE_SECRET` (jak bot↔GH0ST). Domyślnie WYŁĄCZONE.
import { communityEnabled } from './communityPlugins';

// Most gotowy tylko gdy: sekret ustawiony (≥16 znaków — odmawiamy działania na słabym) I community ON.
// Inaczej traktujemy trasy mostu jak nieistniejące (404) — nie zdradzamy ich istnienia.
export function bridgeReady(): boolean {
  const s = process.env.PLUGIN_BRIDGE_SECRET;
  return !!s && s.length >= 16 && communityEnabled();
}

// Porównanie sekretu w stałym czasie (bez wczesnego wyjścia po pierwszej różnicy bajtów).
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Czy żądanie niesie poprawny `Authorization: Bearer <PLUGIN_BRIDGE_SECRET>`. Wołać PO `bridgeReady()`.
export function bridgeAuthorized(request: Request): boolean {
  const secret = process.env.PLUGIN_BRIDGE_SECRET ?? '';
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token.length > 0 && constantTimeEqual(token, secret);
}
