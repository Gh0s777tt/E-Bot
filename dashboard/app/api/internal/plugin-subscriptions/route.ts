import { getMessageSubscriptions } from '../../../../lib/communityPlugins';
import { bridgeAuthorized, bridgeReady } from '../../../../lib/pluginBridge';

export const dynamic = 'force-dynamic';

// Most bot→panel — mapa `guildId → słowa-klucze` dla pluginów community subskrybujących `messageCreate`.
// Bot pobiera to cyklicznie i forwarduje TYLKO pasujące wiadomości (ochrona endpointu przed strumieniem
// wszystkich wiadomości). Uwierzytelnienie i bramki jak w plugin-event (sekret Bearer, 404 gdy OFF).
export async function GET(request: Request): Promise<Response> {
  if (!bridgeReady()) return Response.json({ ok: false, error: 'not found' }, { status: 404 });
  if (!bridgeAuthorized(request)) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const subs = await getMessageSubscriptions();
  return Response.json({ ok: true, subs });
}
