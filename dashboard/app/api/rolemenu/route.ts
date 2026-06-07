import { getRoleMenu, type RoleMenuConfig, saveRoleMenu } from '../../../lib/engagement';
import { parseBody, roleMenuSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getRoleMenu());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, roleMenuSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveRoleMenu(parsed.data as RoleMenuConfig);
  return Response.json({ ok: true, config: await getRoleMenu() });
}
