import { recordAudit } from '../../../lib/audit';
import {
  getVerificationConfig,
  saveVerificationConfig,
  type VerificationConfig,
} from '../../../lib/community';
import { parseBody, verificationSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getVerificationConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, verificationSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveVerificationConfig(parsed.data as VerificationConfig);
  await recordAudit(request, 'verification');
  return Response.json({ ok: true, config: await getVerificationConfig() });
}
