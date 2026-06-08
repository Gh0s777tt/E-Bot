// Użytkownicy panelu / role — GET listy + POST zapis (settings 'panel_staff').
// Tylko admin (egzekwuje proxy: /api/panel-staff jest admin-only). Właściciele (env) są zawsze admin.
import { getStaff, type StaffEntry, saveStaff } from '../../../lib/panelRoles';
import { panelStaffSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json({ staff: await getStaff() });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, panelStaffSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveStaff(parsed.data.staff as StaffEntry[]);
  return Response.json({ ok: true, staff: await getStaff() });
}
