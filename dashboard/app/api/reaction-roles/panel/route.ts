import { getReactionPanel, type ReactionPanel, saveReactionPanel } from '../../../../lib/faza4';
import { parseBody, reactionPanelSchema } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getReactionPanel());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, reactionPanelSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveReactionPanel(parsed.data as ReactionPanel);
  return Response.json({ ok: true, panel: await getReactionPanel() });
}
