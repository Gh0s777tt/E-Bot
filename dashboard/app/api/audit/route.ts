import { getAuditLog } from '../../../lib/audit';
import { isInstanceAdminRequest } from '../../../lib/panelRoles';

export const dynamic = 'force-dynamic';

// Log audytu zawiera dane wrażliwe instancji (kto/co/kiedy + IP). Tylko admin instancji
// (właściciel/staff-admin) — nie editor/viewer/tenant-admin self-serve.
export async function GET(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }
  return Response.json(await getAuditLog(100));
}
