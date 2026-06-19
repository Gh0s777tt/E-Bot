// Rejestruje subskrypcję Twitch EventSub (stream.online) na webhook panelu.
// Uruchom PO wdrożeniu panelu (Twitch weryfikuje callback challengem podczas rejestracji):
//   node dashboard/scripts/eventsub-setup.mts
import path from 'node:path';

process.loadEnvFile(path.join(import.meta.dirname, '..', '..', '.env'));

const id = process.env.TWITCH_CLIENT_ID;
const secret = process.env.TWITCH_CLIENT_SECRET;
const channel = process.env.TWITCH_CHANNEL;
const esSecret = process.env.TWITCH_EVENTSUB_SECRET;
const callback = process.env.EVENTSUB_CALLBACK || 'https://e-bot-dc.vercel.app/api/twitch/eventsub';

if (!id || !secret || !channel || !esSecret) {
  console.error('Brak TWITCH_CLIENT_ID/SECRET, TWITCH_CHANNEL lub TWITCH_EVENTSUB_SECRET w .env');
  process.exit(1);
}

const tok = await (
  await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`,
    { method: 'POST' },
  )
).json();
const h = {
  'Client-Id': id,
  Authorization: `Bearer ${tok.access_token}`,
  'Content-Type': 'application/json',
};

const user = (
  await (await fetch(`https://api.twitch.tv/helix/users?login=${channel}`, { headers: h })).json()
).data?.[0];
if (!user) {
  console.error('Nie znaleziono kanału Twitch:', channel);
  process.exit(1);
}
console.log(`Kanał: ${channel} (id ${user.id}) · callback: ${callback}`);

// Rejestrujemy dwie subskrypcje: stream.online (powiadomienia live) oraz channel.subscribe
// (tor N — subskrypcja Twitch → rola Discord). Ta druga wymaga, by broadcaster wcześniej
// autoryzował aplikację scope `channel:read:subscriptions` (jednorazowy OAuth twórcy).
const TYPES = ['stream.online', 'channel.subscribe'] as const;
const existing =
  (await (await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', { headers: h })).json())
    .data || [];
for (const type of TYPES) {
  // posprzątaj stare subskrypcje tego typu na ten callback
  for (const s of existing) {
    if (s.type === type && s.transport?.callback === callback) {
      await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${s.id}`, {
        method: 'DELETE',
        headers: h,
      });
      console.log('usunięto starą subskrypcję', s.id, type, `(${s.status})`);
    }
  }
  const res = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      type,
      version: '1',
      condition: { broadcaster_user_id: user.id },
      transport: { method: 'webhook', callback, secret: esSecret },
    }),
  });
  const out = await res.json();
  const sub = out.data?.[0];
  if (sub) console.log(`✅ ${type}: ${sub.id} · status: ${sub.status}`);
  else
    console.error(
      `❌ ${type} (HTTP ${res.status}):`,
      JSON.stringify(out).slice(0, 300),
      type === 'channel.subscribe'
        ? '— channel.subscribe wymaga autoryzacji broadcastera scope channel:read:subscriptions'
        : '',
    );
}
