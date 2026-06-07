// Webhook Ko-fi — Ko-fi POST-uje (form-urlencoded, pole `data` = JSON) przy donejcie/subskrypcji.
// Trasa PUBLICZNA (proxy.ts przepuszcza dokładnie /api/kofi); autoryzacja = verification_token z configu.
import { timingSafeEqual } from 'node:crypto';
import { getKofiConfig } from '../../../lib/community';

// Porównanie w czasie stałym — nie wycieka długości/treści tokenu przez timing.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export const dynamic = 'force-dynamic';

type KofiData = {
  verification_token?: string;
  type?: string;
  from_name?: string;
  message?: string | null;
  amount?: string;
  currency?: string;
  is_public?: boolean;
};

export async function POST(request: Request): Promise<Response> {
  let dataStr = '';
  try {
    const form = await request.formData();
    dataStr = String(form.get('data') ?? '');
  } catch {
    const text = await request.text().catch(() => '');
    dataStr = new URLSearchParams(text).get('data') ?? '';
  }
  if (!dataStr) return new Response('bad request', { status: 400 });

  let d: KofiData;
  try {
    d = JSON.parse(dataStr) as KofiData;
  } catch {
    return new Response('bad json', { status: 400 });
  }

  const cfg = await getKofiConfig();
  if (!cfg.verificationToken || !safeEqual(d.verification_token ?? '', cfg.verificationToken)) {
    return new Response('forbidden', { status: 403 });
  }
  if (!cfg.enabled || !cfg.channelId) return new Response('ok', { status: 200 });

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return new Response('ok', { status: 200 });

  const content = (
    cfg.message || '🤝 **{name}** wsparł(a) nas za **{amount} {currency}**! {message}'
  )
    .replaceAll('{name}', d.from_name || 'Anonim')
    .replaceAll('{amount}', d.amount || '')
    .replaceAll('{currency}', d.currency || '')
    .replaceAll('{type}', d.type || 'Donation')
    .replaceAll('{message}', d.is_public && d.message ? d.message : '')
    .slice(0, 1500);

  const embed = {
    color: 0xe50914,
    title: '🤝 Nowe wsparcie!',
    description: content,
    timestamp: new Date().toISOString(),
  };

  await fetch(`https://discord.com/api/v10/channels/${cfg.channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  }).catch(() => {});

  return new Response('ok', { status: 200 });
}
