import { getLiveStatuses } from '../../../lib/live';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getLiveStatuses());
}
