// POST /api/patchnotes/test — „Testuj feed": zwraca 3 najnowsze wpisy ze źródła (Steam/RSS), żeby admin
// potwierdził, że feed działa, zanim poczeka na poller. Wymaga sesji + twarda blokada SSRF dla URLi RSS.
import { cookies } from 'next/headers';
import { parseBody, patchTestSchema } from '../../../../lib/schemas';
import { getAuthSecret, verifySession } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function authed(): Promise<boolean> {
  try {
    const t = (await cookies()).get('ebot_session')?.value;
    return !!t && !!(await verifySession(t, getAuthSecret()));
  } catch {
    return false;
  }
}

// SSRF: tylko http(s) + publiczny host (bez localhost / adresów prywatnych / link-local / ULA).
function isSafePublicUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return false;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(h)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
  if (h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) return false;
  return true;
}

type Item = { title: string; url: string };
type Source = { kind: 'steam'; appId: number } | { kind: 'rss'; url: string };

function cleanTitle(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
    .slice(0, 200);
}

async function fetchLatest(source: Source): Promise<Item[] | null> {
  if (source.kind === 'steam') {
    const r = await fetch(
      `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${source.appId}&count=3&maxlength=200`,
      { signal: AbortSignal.timeout(12_000) },
    ).catch(() => null);
    if (!r?.ok) return null;
    const d = (await r.json().catch(() => ({}))) as {
      appnews?: { newsitems?: { title?: string; url?: string }[] };
    };
    return (d.appnews?.newsitems ?? [])
      .slice(0, 3)
      .map((n) => ({ title: n.title ?? '—', url: n.url ?? '' }));
  }
  if (!isSafePublicUrl(source.url)) return null;
  const r = await fetch(source.url, {
    headers: { 'user-agent': UA, accept: 'application/rss+xml, application/xml, text/xml, */*' },
    signal: AbortSignal.timeout(12_000),
  }).catch(() => null);
  if (!r?.ok) return null;
  const xml = await r.text().catch(() => '');
  const items: Item[] = [];
  for (const b of (xml.match(/<(item|entry)[\s\S]*?<\/(?:item|entry)>/gi) ?? []).slice(0, 3)) {
    const title = cleanTitle(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(b)?.[1] ?? '');
    const link =
      /<link[^>]*>([\s\S]*?)<\/link>/i.exec(b)?.[1]?.trim() ||
      /<link[^>]*href="([^"]+)"/i.exec(b)?.[1] ||
      '';
    if (title) items.push({ title, url: link });
  }
  return items;
}

export async function POST(request: Request): Promise<Response> {
  if (!(await authed()))
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const parsed = await parseBody(request, patchTestSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const items = await fetchLatest(parsed.data.source as Source);
  if (items === null) return Response.json({ ok: false, error: 'feed-unreachable' });
  return Response.json({ ok: true, items });
}
