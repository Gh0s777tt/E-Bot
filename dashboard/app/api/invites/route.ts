import { getInvitesConfig, type InvitesConfig, saveInvitesConfig } from '../../../lib/engagement';
import { invitesSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getInvitesConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, invitesSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveInvitesConfig(parsed.data as InvitesConfig);
  return Response.json({ ok: true, config: await getInvitesConfig() });
}
