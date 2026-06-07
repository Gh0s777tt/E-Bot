import { getAuditLog } from '../../../lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAuditLog(100));
}
