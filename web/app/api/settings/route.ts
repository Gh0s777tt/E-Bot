import { createHash, timingSafeEqual } from 'node:crypto';
import { clientIp, rateLimited } from '../../../lib/rateLimit';
import { getSettings, saveSettings } from '../../../lib/settings';

export const dynamic = 'force-dynamic';

// Zapis ustawień powiadomień pisze do WSPÓŁDZIELONEJ bot.db (czytanej na żywo przez bota),
// więc POST wymaga sekretu admina. Fail-closed: brak WEB_ADMIN_SECRET w env ⇒ zapis
// zablokowany (401). Porównanie timing-safe na skrótach SHA-256 (równa długość, bez wycieku).
function sha(s: string): Buffer {
  return createHash('sha256').update(s).digest();
}
function authorized(request: Request): boolean {
  const secret = process.env.WEB_ADMIN_SECRET;
  if (!secret) return false;
  const provided = request.headers.get('x-admin-secret') ?? '';
  return timingSafeEqual(sha(provided), sha(secret));
}

export async function GET(): Promise<Response> {
  return Response.json(await getSettings());
}

// Audyt: jedyną bramką zapisu jest JEDEN współdzielony sekret instancji — bez limitu dawał się
// brute-force'ować bez żadnego oporu. 10/min per IP wystarcza operatorowi (formularz zapisuje raz),
// a atak słownikowy na `x-admin-secret` robi się bezużyteczny. Limit PRZED porównaniem sekretu.
const POST_RATE_LIMIT = 10;

export async function POST(request: Request): Promise<Response> {
  if (rateLimited(`settings:${clientIp(request)}`, POST_RATE_LIMIT)) {
    return Response.json({ ok: false, error: 'rate limited' }, { status: 429 });
  }
  if (!authorized(request)) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(body)) {
      flat[k] = typeof v === 'boolean' ? (v ? '1' : '0') : String(v ?? '');
    }
    await saveSettings(flat);
    return Response.json({ ok: true, settings: await getSettings() });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
