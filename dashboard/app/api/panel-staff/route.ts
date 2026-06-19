// Użytkownicy panelu / role — GET listy + POST zapis (settings 'panel_staff').
// INSTANCE-GLOBAL: wymaga admina INSTANCJI (właściciel/staff-admin), nie samej roli sesji —
// inaczej tenant-admin self-serve (role='admin') mógłby przejąć staff. Patrz isInstanceAdminRequest.
import {
  getStaff,
  isInstanceAdminRequest,
  type StaffEntry,
  saveStaff,
} from '../../../lib/panelRoles';
import { panelStaffSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

const FORBIDDEN = () => new Response('Brak uprawnień (admin instancji).', { status: 403 });

export async function GET(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) return FORBIDDEN();
  return Response.json({ staff: await getStaff() });
}

export async function POST(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) return FORBIDDEN();
  const parsed = await parseBody(request, panelStaffSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveStaff(parsed.data.staff as StaffEntry[]);
  return Response.json({ ok: true, staff: await getStaff() });
}
