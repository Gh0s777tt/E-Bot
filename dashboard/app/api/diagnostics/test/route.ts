import { runConnectionTests } from '../../../../lib/connectionTest';
import { isInstanceAdminRequest } from '../../../../lib/panelRoles';

export const dynamic = 'force-dynamic';

// Realne pingi integracji (Discord/Supabase/AI) — wykonują żądania z sekretami, więc bramka
// instance-admin (jak strona /diagnostics).
export async function GET(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }
  return Response.json({ tests: await runConnectionTests() });
}
