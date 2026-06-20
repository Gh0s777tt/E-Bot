// Globalny hook błędów serwera Next 16 (`onRequestError`) → Sentry ([lib/sentry.ts]).
// Łapie NIEOBSŁUŻONE błędy route handlerów, renderu RSC i server actions — wcześniej `captureError`
// było wołane TYLKO z relay klienta (`/api/sentry`), więc błędy serwera panelu były NIEWIDOCZNE.
// No-op bez `SENTRY_DSN` (uśpione), nigdy nie wywraca żądania.
import { captureError } from './lib/sentry';

type RequestInfo = { path?: string; method?: string };
type ErrorContext = { routerKind?: string; routePath?: string; routeType?: string };

export async function onRequestError(
  error: unknown,
  request: RequestInfo,
  context: ErrorContext,
): Promise<void> {
  const e = error as { message?: unknown; stack?: unknown };
  const message = e?.message != null ? String(e.message) : String(error);
  await captureError(message, {
    label: 'server',
    stack: typeof e?.stack === 'string' ? e.stack : undefined,
    extra: {
      path: request?.path,
      method: request?.method,
      routePath: context?.routePath,
      routeType: context?.routeType,
      routerKind: context?.routerKind,
    },
  });
}
