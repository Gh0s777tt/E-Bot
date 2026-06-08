// Tor 5+ — Supabase Realtime przez NATYWNY WebSocket (Node 26, zero zależności): subskrybuje
// zmiany tabeli `settings` (Phoenix/Realtime v1.0.0) i wywołuje natychmiastowy settings-sync,
// więc zmiany z panelu wchodzą do bota od ręki zamiast czekać na poll 60 s. Poll zostaje fallbackiem.
//
// Wymaga (opcjonalnie) DB-side jednorazowo:
//   ALTER PUBLICATION supabase_realtime ADD TABLE settings;
// Bez tego subskrypcja po prostu nie dostaje zdarzeń → graceful fallback na poll (zero breakage).
import { creds, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';
import { syncSettingsNow } from './settings-sync.mts';

// Minimalny interfejs natywnego WebSocket (bez zależności od lib.dom w tsconfig bota).
type WSLike = {
  send(data: string): void;
  close(): void;
  addEventListener(type: 'open' | 'close' | 'error', cb: () => void): void;
  addEventListener(type: 'message', cb: (ev: { data: unknown }) => void): void;
};
const WSCtor = (globalThis as { WebSocket?: new (url: string) => WSLike }).WebSocket;

const TOPIC = 'realtime:db-settings';
let heartbeat: ReturnType<typeof setInterval> | null = null;
let ref = 1;
let backoff = 2_000;
let stop = false;

function connect(): void {
  if (stop || !WSCtor) return;
  const { url, key } = creds();
  if (!url || !key) return;
  const wsUrl = `${url.replace(/^http/, 'ws')}/realtime/v1/websocket?apikey=${encodeURIComponent(key)}&vsn=1.0.0`;

  let socket: WSLike;
  try {
    socket = new WSCtor(wsUrl);
  } catch (e) {
    log.warn('realtime: nie udało się otworzyć WebSocket', { err: e });
    scheduleReconnect();
    return;
  }

  socket.addEventListener('open', () => {
    backoff = 2_000;
    const joinRef = String(ref++);
    // Dołącz do kanału z subskrypcją postgres_changes na public.settings.
    socket.send(
      JSON.stringify({
        topic: TOPIC,
        event: 'phx_join',
        payload: {
          config: {
            broadcast: { ack: false, self: false },
            presence: { key: '' },
            postgres_changes: [{ event: '*', schema: 'public', table: 'settings' }],
          },
        },
        ref: joinRef,
        join_ref: joinRef,
      }),
    );
    // Ustaw token (service_role) — omija RLS dla postgres_changes.
    socket.send(
      JSON.stringify({
        topic: TOPIC,
        event: 'access_token',
        payload: { access_token: key },
        ref: String(ref++),
      }),
    );
    // Phoenix heartbeat — bez niego serwer zrywa połączenie po ~30-60 s.
    heartbeat = setInterval(() => {
      try {
        socket.send(
          JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(ref++) }),
        );
      } catch {
        /* gniazdo zamknięte */
      }
    }, 25_000);
    log.info('realtime: połączono — subskrybuję zmiany settings');
  });

  socket.addEventListener('message', (ev) => {
    let msg: { event?: string; payload?: { status?: string } };
    try {
      msg = JSON.parse(String(ev.data)) as typeof msg;
    } catch {
      return;
    }
    if (msg.event === 'postgres_changes') {
      syncSettingsNow(); // zmiana w tabeli settings → natychmiastowy sync
    } else if (msg.event === 'phx_reply' && msg.payload?.status === 'ok') {
      log.info('realtime: subskrypcja settings aktywna');
    }
  });

  const onDown = () => {
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
    scheduleReconnect();
  };
  socket.addEventListener('close', onDown);
  socket.addEventListener('error', () => {
    /* po błędzie nastąpi 'close' → tam reconnect */
  });
}

function scheduleReconnect(): void {
  if (stop) return;
  setTimeout(connect, backoff);
  backoff = Math.min(backoff * 2, 60_000); // wykładniczy backoff do 60 s
}

export function startRealtimeSync(): void {
  if (!hasCloud()) {
    log.info('realtime: brak chmury — pomijam (zostaje poll 60 s)');
    return;
  }
  if (!WSCtor) {
    log.warn('realtime: brak globalnego WebSocket — pomijam (zostaje poll 60 s)');
    return;
  }
  stop = false;
  connect();
}
