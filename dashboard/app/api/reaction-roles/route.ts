import { getReactionRoles, saveReactionRoles } from '../../../lib/faza4';
import { parseBody, reactionRolesSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json({ items: await getReactionRoles() });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, reactionRolesSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveReactionRoles(parsed.data.items);
  return Response.json({ ok: true, items: await getReactionRoles() });
}
