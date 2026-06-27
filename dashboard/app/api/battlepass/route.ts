import { getBattlePassRoles, saveBattlePassRoles } from '../../../lib/battlepass';
import { bpRolesSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json({ roles: await getBattlePassRoles() });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, bpRolesSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveBattlePassRoles(parsed.data.roles);
  return Response.json({ ok: true, roles: await getBattlePassRoles() });
}
