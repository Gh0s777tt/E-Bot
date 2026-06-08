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
  addEventListener(type: 'open', cb: () => void): void;
  addEventListener(type: 'close', cb: (ev: { code?: number; reason?: string }) => void): void;
  addEventListener(type: 'error', cb: () => void): void;
  addEventListener(type: 'message', cb: (ev: { data: unknown }) => void): void;
};
const WSCtor = (globalThis as { WebSocket?: new (url: string) => WSLike }).WebSocket;

// Do połączenia preferuj anon (apikey), do RLS preferuj service_role (access_token).
function realtimeKeys(): { apikey: string; token: string } {
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { apikey: anon || svc, token: svc || anon };
}

const TOPIC = 'realtime:db-settings';
let heartbeat: ReturnType<typeof setInterval> | null = null;
let ref = 1;
let backoff = 2_000;
let attempts = 0;
let subscribed = false;

function connect(): void {
  if (!WSCtor) return;
  subscribed = false;
  const { url } = creds();
  const { apikey, token } = realtimeKeys();
  if (!url || !apikey) return;
  const wsUrl = `${url.replace(/^http/, 'ws')}/realtime/v1/websocket?apikey=${encodeURIComponent(apikey)}&vsn=1.0.0`;
  attempts++;

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
          access_token: token,
        },
        ref: joinRef,
        join_ref: joinRef,
      }),
    );
    socket.send(
      JSON.stringify({
        topic: TOPIC,
        event: 'access_token',
        payload: { access_token: token },
        ref: String(ref++),
      }),
    );
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
    let msg: { topic?: string; event?: string; payload?: { status?: string; response?: unknown } };
    try {
      msg = JSON.parse(String(ev.data)) as typeof msg;
    } catch {
      return;
    }
    if (msg.event === 'postgres_changes') {
      syncSettingsNow(); // zmiana w tabeli settings → natychmiastowy sync
    } else if (msg.topic === TOPIC && msg.event === 'phx_reply') {
      // tylko odpowiedź na nasz join (nie na heartbeat z topicu "phoenix")
      if (msg.payload?.status === 'ok' && !subscribed) {
        subscribed = true;
        log.info('realtime: subskrypcja settings aktywna');
      } else if (msg.payload?.status === 'error') {
        log.warn('realtime: serwer odrzucił subskrypcję', { resp: msg.payload?.response });
      }
    }
  });

  const onDown = (ev?: { code?: number; reason?: string }) => {
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
    if (attempts <= 3) {
      log.warn('realtime: rozłączono — ponawiam (fallback: poll 60 s)', {
        code: ev?.code,
        reason: ev?.reason,
      });
    }
    scheduleReconnect();
  };
  socket.addEventListener('close', onDown);
  socket.addEventListener('error', () => {
    /* po błędzie nastąpi 'close' → tam reconnect */
  });
}

function scheduleReconnect(): void {
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
  log.info('realtime: start — łączę z Supabase Realtime');
  connect();
}
