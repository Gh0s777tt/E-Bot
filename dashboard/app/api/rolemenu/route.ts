import { getRoleMenu, type RoleMenuConfig, saveRoleMenu } from '../../../lib/engagement';
import { guardLimit } from '../../../lib/planLimits';
import { parseBody, roleMenuSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getRoleMenu());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, roleMenuSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const current = (await getRoleMenu()).options?.length ?? 0;
  const gate = await guardLimit('rolemenus', parsed.data.options.length, current);
  if (!gate.ok) return Response.json({ ok: false, error: gate.error }, { status: 403 });
  await saveRoleMenu(parsed.data as RoleMenuConfig);
  return Response.json({ ok: true, config: await getRoleMenu() });
}
