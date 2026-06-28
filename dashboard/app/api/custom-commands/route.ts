// No-code komendy slash — GET listy + POST zapis (settings 'custom_commands' + rejestracja w Discord).
// Chronione sesją przez proxy.
import {
  type CustomCommand,
  getCustomCommands,
  saveCustomCommands,
} from '../../../lib/customCommands';
import { guardLimit } from '../../../lib/planLimits';
import { customCommandsSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json({ commands: await getCustomCommands() });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, customCommandsSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const current = (await getCustomCommands()).length;
  const gate = await guardLimit('customCommands', parsed.data.commands.length, current);
  if (!gate.ok) return Response.json({ ok: false, error: gate.error }, { status: 403 });
  const res = await saveCustomCommands(parsed.data.commands as CustomCommand[]);
  return Response.json(
    {
      ok: res.ok,
      error: res.error,
      registered: res.registered,
      commands: await getCustomCommands(),
    },
    { status: res.ok ? 200 : 400 },
  );
}
