import { getAuditLog } from '../../../../lib/audit';
import { csvResponse, toCsv } from '../../../../lib/csv';
import { isInstanceAdminRequest } from '../../../../lib/panelRoles';

export const dynamic = 'force-dynamic';

// Eksport dziennika audytu do CSV — powierzchnia instancyjna (zawiera IP), więc bramka jak na GET /audit:
// tylko admin instancji. Do raportów / RODO.
export async function GET(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }
  const rows = await getAuditLog(1000);
  const csv = toCsv(
    ['when', 'who', 'uid', 'area', 'detail', 'ip'],
    rows.map((e) => [
      e.created_at ?? '',
      e.uname ?? '',
      e.uid ?? '',
      e.area ?? '',
      e.detail ?? '',
      e.ip ?? '',
    ]),
  );
  return csvResponse(csv, 'audit-log.csv');
}
