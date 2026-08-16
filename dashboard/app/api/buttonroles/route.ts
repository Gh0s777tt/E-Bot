import { recordAudit } from '../../../lib/audit';
import { type ButtonRolesConfig, getButtonRoles, saveButtonRoles } from '../../../lib/engagement';
import { buttonRolesSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getButtonRoles());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, buttonRolesSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveButtonRoles(parsed.data as ButtonRolesConfig);
  await recordAudit(request, 'buttonroles');
  return Response.json({ ok: true, config: await getButtonRoles() });
}
