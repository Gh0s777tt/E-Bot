// Etap K — domyślny tryb panelu wg rangi (gdy użytkownik nie wybrał własnego). Właściciel → Developer,
// viewer → Prosty, admin/editor → Zaawansowany. Tylko podpowiedź startowa; użytkownik może zmienić.
import { authConfig } from '../../../lib/auth';
import { currentSession } from '../../../lib/panelRoles';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const s = await currentSession();
  let mode: 'simple' | 'adv' | 'dev' = 'adv';
  if (s) {
    if (authConfig().owners.includes(s.uid)) mode = 'dev';
    else if (s.role === 'viewer') mode = 'simple';
  }
  return Response.json({ mode });
}
