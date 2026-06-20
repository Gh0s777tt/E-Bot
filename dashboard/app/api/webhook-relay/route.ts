// Relay generic-webhooka (GLOBALNY, single-instance: token + kanał docelowy). Bramka
// isInstanceAdminRequest: w self-serve tenant-admin NIE może odczytać tokenu (GET) ani przejąć
// kanału przez nadpisanie token/channelId (POST). Trasa publiczna /api/hook strzela w TEN kanał.
import {
  getWebhookRelay,
  saveWebhookRelay,
  type WebhookRelayConfig,
} from '../../../lib/integrations';
import { isInstanceAdminRequest } from '../../../lib/panelRoles';
import { parseBody, webhookRelaySchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  return Response.json(await getWebhookRelay());
}

export async function POST(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  const parsed = await parseBody(request, webhookRelaySchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveWebhookRelay(parsed.data as WebhookRelayConfig);
  return Response.json({ ok: true, config: await getWebhookRelay() });
}
