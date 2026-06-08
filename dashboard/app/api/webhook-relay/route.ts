import {
  getWebhookRelay,
  saveWebhookRelay,
  type WebhookRelayConfig,
} from '../../../lib/integrations';
import { parseBody, webhookRelaySchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getWebhookRelay());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, webhookRelaySchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveWebhookRelay(parsed.data as WebhookRelayConfig);
  return Response.json({ ok: true, config: await getWebhookRelay() });
}
