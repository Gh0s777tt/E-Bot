import { getReactionRoles, saveReactionRoles } from '../../../lib/faza4';
import { guardLimit } from '../../../lib/planLimits';
import { parseBody, reactionRolesSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json({ items: await getReactionRoles() });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, reactionRolesSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const current = (await getReactionRoles()).length;
  const gate = await guardLimit('reactionRoles', parsed.data.items.length, current);
  if (!gate.ok) return Response.json({ ok: false, error: gate.error }, { status: 403 });
  await saveReactionRoles(parsed.data.items);
  return Response.json({ ok: true, items: await getReactionRoles() });
}
