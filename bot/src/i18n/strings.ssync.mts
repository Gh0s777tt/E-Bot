// Słownik /streamsync (Twitch Schedule → Discord Events) — 14 języków. {login}{count} = placeholdery.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const SSYNC_STRINGS: Record<Locale, Dict> = {
  pl: {
    'ssync.on':
      '📅 Synchronizacja harmonogramu Twitch włączona — kanał **{login}**. Wydarzenia Discord pojawią się za chwilę, potem odświeżanie co ~6 h.',
    'ssync.off': '✅ Synchronizacja harmonogramu wyłączona (utworzone wydarzenia zostają).',
    'ssync.statusOn':
      '📅 Sync harmonogramu: **włączony** — kanał **{login}**, zsynchronizowane segmenty: {count}.',
    'ssync.statusOff': 'ℹ️ Sync harmonogramu: wyłączony. Włącz: `/streamsync stan:ON`.',
    'ssync.noLogin': '⚠️ Brak kanału Twitch — podaj opcję `login` (nie ustawiono TWITCH_CHANNEL).',
    'ssync.noCreds':
      '🔑 Brak kluczy Twitch (TWITCH_CLIENT_ID/SECRET) — funkcja gotowa, ruszy gdy dodasz klucze.',
  },
  en: {
    'ssync.on':
      '📅 Twitch schedule sync enabled — channel **{login}**. Discord events will appear shortly, then refresh every ~6 h.',
    'ssync.off': '✅ Schedule sync disabled (created events stay).',
    'ssync.statusOn':
      '📅 Schedule sync: **enabled** — channel **{login}**, synced segments: {count}.',
    'ssync.statusOff': 'ℹ️ Schedule sync: disabled. Enable: `/streamsync stan:ON`.',
    'ssync.noLogin': '⚠️ No Twitch channel — pass the `login` option (TWITCH_CHANNEL not set).',
    'ssync.noCreds':
      '🔑 Missing Twitch keys (TWITCH_CLIENT_ID/SECRET) — feature is ready, it will run once you add keys.',
  },
  de: {
    'ssync.on':
      '📅 Twitch-Zeitplan-Sync aktiviert — Kanal **{login}**. Discord-Events erscheinen gleich, danach Aktualisierung alle ~6 h.',
    'ssync.off': '✅ Zeitplan-Sync deaktiviert (erstellte Events bleiben).',
    'ssync.statusOn':
      '📅 Zeitplan-Sync: **aktiv** — Kanal **{login}**, synchronisierte Segmente: {count}.',
    'ssync.statusOff': 'ℹ️ Zeitplan-Sync: aus. Aktivieren: `/streamsync stan:ON`.',
    'ssync.noLogin':
      '⚠️ Kein Twitch-Kanal — gib die Option `login` an (TWITCH_CHANNEL nicht gesetzt).',
    'ssync.noCreds':
      '🔑 Twitch-Schlüssel fehlen (TWITCH_CLIENT_ID/SECRET) — Funktion ist bereit und startet, sobald du Schlüssel hinzufügst.',
  },
  es: {
    'ssync.on':
      '📅 Sincronización del horario de Twitch activada — canal **{login}**. Los eventos de Discord aparecerán en breve; luego se actualiza cada ~6 h.',
    'ssync.off': '✅ Sincronización del horario desactivada (los eventos creados se quedan).',
    'ssync.statusOn':
      '📅 Sync del horario: **activado** — canal **{login}**, segmentos sincronizados: {count}.',
    'ssync.statusOff': 'ℹ️ Sync del horario: desactivado. Actívalo: `/streamsync stan:ON`.',
    'ssync.noLogin':
      '⚠️ Falta el canal de Twitch — pasa la opción `login` (TWITCH_CHANNEL no está definido).',
    'ssync.noCreds':
      '🔑 Faltan las claves de Twitch (TWITCH_CLIENT_ID/SECRET) — la función está lista y arrancará cuando añadas las claves.',
  },
  it: {
    'ssync.on':
      '📅 Sincronizzazione del palinsesto Twitch attivata — canale **{login}**. Gli eventi Discord appariranno a breve, poi aggiornamento ogni ~6 h.',
    'ssync.off': '✅ Sincronizzazione del palinsesto disattivata (gli eventi creati restano).',
    'ssync.statusOn':
      '📅 Sync palinsesto: **attivo** — canale **{login}**, segmenti sincronizzati: {count}.',
    'ssync.statusOff': 'ℹ️ Sync palinsesto: disattivato. Attiva: `/streamsync stan:ON`.',
    'ssync.noLogin':
      '⚠️ Manca il canale Twitch — passa l’opzione `login` (TWITCH_CHANNEL non impostato).',
    'ssync.noCreds':
      '🔑 Mancano le chiavi Twitch (TWITCH_CLIENT_ID/SECRET) — la funzione è pronta e partirà quando aggiungerai le chiavi.',
  },
  fr: {
    'ssync.on':
      '📅 Synchronisation du planning Twitch activée — chaîne **{login}**. Les événements Discord apparaîtront sous peu, puis actualisation toutes les ~6 h.',
    'ssync.off': '✅ Synchronisation du planning désactivée (les événements créés restent).',
    'ssync.statusOn':
      '📅 Sync du planning : **activée** — chaîne **{login}**, segments synchronisés : {count}.',
    'ssync.statusOff': 'ℹ️ Sync du planning : désactivée. Activer : `/streamsync stan:ON`.',
    'ssync.noLogin': '⚠️ Aucune chaîne Twitch — passe l’option `login` (TWITCH_CHANNEL non défini).',
    'ssync.noCreds':
      '🔑 Clés Twitch manquantes (TWITCH_CLIENT_ID/SECRET) — la fonction est prête et démarrera dès que tu ajoutes les clés.',
  },
  pt: {
    'ssync.on':
      '📅 Sincronização da agenda da Twitch ativada — canal **{login}**. Os eventos do Discord aparecerão em breve; depois atualiza a cada ~6 h.',
    'ssync.off': '✅ Sincronização da agenda desativada (os eventos criados ficam).',
    'ssync.statusOn':
      '📅 Sync da agenda: **ativado** — canal **{login}**, segmentos sincronizados: {count}.',
    'ssync.statusOff': 'ℹ️ Sync da agenda: desativado. Ative: `/streamsync stan:ON`.',
    'ssync.noLogin':
      '⚠️ Falta o canal da Twitch — passe a opção `login` (TWITCH_CHANNEL não definido).',
    'ssync.noCreds':
      '🔑 Faltam as chaves da Twitch (TWITCH_CLIENT_ID/SECRET) — a função está pronta e vai rodar quando você adicionar as chaves.',
  },
  zh: {
    'ssync.on':
      '📅 Twitch 日程同步已开启 — 频道 **{login}**。Discord 活动稍后出现，之后每 ~6 小时刷新。',
    'ssync.off': '✅ 日程同步已关闭（已创建的活动会保留）。',
    'ssync.statusOn': '📅 日程同步：**已开启** — 频道 **{login}**，已同步时段：{count}。',
    'ssync.statusOff': 'ℹ️ 日程同步：已关闭。开启：`/streamsync stan:ON`。',
    'ssync.noLogin': '⚠️ 缺少 Twitch 频道 — 请填写 `login` 选项（未设置 TWITCH_CHANNEL）。',
    'ssync.noCreds':
      '🔑 缺少 Twitch 密钥（TWITCH_CLIENT_ID/SECRET）— 功能已就绪，添加密钥后即可运行。',
  },
  ko: {
    'ssync.on':
      '📅 Twitch 일정 동기화 활성화 — 채널 **{login}**. Discord 이벤트가 곧 나타나며, 이후 ~6시간마다 갱신됩니다.',
    'ssync.off': '✅ 일정 동기화 비활성화 (생성된 이벤트는 유지됩니다).',
    'ssync.statusOn': '📅 일정 동기화: **켜짐** — 채널 **{login}**, 동기화된 구간: {count}.',
    'ssync.statusOff': 'ℹ️ 일정 동기화: 꺼짐. 켜기: `/streamsync stan:ON`.',
    'ssync.noLogin': '⚠️ Twitch 채널 없음 — `login` 옵션을 입력하세요 (TWITCH_CHANNEL 미설정).',
    'ssync.noCreds':
      '🔑 Twitch 키 없음 (TWITCH_CLIENT_ID/SECRET) — 기능은 준비되었고 키를 추가하면 작동합니다.',
  },
  ru: {
    'ssync.on':
      '📅 Синхронизация расписания Twitch включена — канал **{login}**. События Discord появятся вскоре, далее обновление каждые ~6 ч.',
    'ssync.off': '✅ Синхронизация расписания выключена (созданные события остаются).',
    'ssync.statusOn':
      '📅 Синхронизация расписания: **включена** — канал **{login}**, синхронизировано сегментов: {count}.',
    'ssync.statusOff': 'ℹ️ Синхронизация расписания: выключена. Включить: `/streamsync stan:ON`.',
    'ssync.noLogin': '⚠️ Не указан канал Twitch — передай опцию `login` (TWITCH_CHANNEL не задан).',
    'ssync.noCreds':
      '🔑 Нет ключей Twitch (TWITCH_CLIENT_ID/SECRET) — функция готова и заработает, когда добавишь ключи.',
  },
  uk: {
    'ssync.on':
      '📅 Синхронізацію розкладу Twitch увімкнено — канал **{login}**. Події Discord зʼявляться незабаром, далі оновлення кожні ~6 год.',
    'ssync.off': '✅ Синхронізацію розкладу вимкнено (створені події залишаються).',
    'ssync.statusOn':
      '📅 Синхронізація розкладу: **увімкнена** — канал **{login}**, синхронізовано сегментів: {count}.',
    'ssync.statusOff': 'ℹ️ Синхронізація розкладу: вимкнена. Увімкнути: `/streamsync stan:ON`.',
    'ssync.noLogin':
      '⚠️ Не вказано канал Twitch — передай опцію `login` (TWITCH_CHANNEL не задано).',
    'ssync.noCreds':
      '🔑 Немає ключів Twitch (TWITCH_CLIENT_ID/SECRET) — функція готова й запрацює, щойно додаси ключі.',
  },
  ja: {
    'ssync.on':
      '📅 Twitch スケジュール同期を有効化 — チャンネル **{login}**。Discord イベントはまもなく作成され、その後 ~6 時間ごとに更新されます。',
    'ssync.off': '✅ スケジュール同期を無効化しました（作成済みイベントは残ります）。',
    'ssync.statusOn':
      '📅 スケジュール同期：**有効** — チャンネル **{login}**、同期済みセグメント：{count}。',
    'ssync.statusOff': 'ℹ️ スケジュール同期：無効。有効化：`/streamsync stan:ON`。',
    'ssync.noLogin':
      '⚠️ Twitch チャンネルがありません — `login` オプションを指定してください（TWITCH_CHANNEL 未設定）。',
    'ssync.noCreds':
      '🔑 Twitch キーがありません（TWITCH_CLIENT_ID/SECRET）— 機能は準備済みで、キーを追加すると動き出します。',
  },
  ar: {
    'ssync.on':
      '📅 تم تفعيل مزامنة جدول Twitch — القناة **{login}**. ستظهر أحداث Discord قريبًا، ثم تحديث كل ~6 ساعات.',
    'ssync.off': '✅ تم إيقاف مزامنة الجدول (تبقى الأحداث المنشأة).',
    'ssync.statusOn':
      '📅 مزامنة الجدول: **مفعّلة** — القناة **{login}**، المقاطع المتزامنة: {count}.',
    'ssync.statusOff': 'ℹ️ مزامنة الجدول: متوقفة. التفعيل: `/streamsync stan:ON`.',
    'ssync.noLogin': '⚠️ لا توجد قناة Twitch — مرّر خيار `login` (لم يتم ضبط TWITCH_CHANNEL).',
    'ssync.noCreds':
      '🔑 مفاتيح Twitch مفقودة (TWITCH_CLIENT_ID/SECRET) — الميزة جاهزة وستعمل عند إضافة المفاتيح.',
  },
  id: {
    'ssync.on':
      '📅 Sinkronisasi jadwal Twitch diaktifkan — channel **{login}**. Event Discord akan muncul sebentar lagi, lalu diperbarui tiap ~6 jam.',
    'ssync.off': '✅ Sinkronisasi jadwal dimatikan (event yang sudah dibuat tetap ada).',
    'ssync.statusOn':
      '📅 Sinkronisasi jadwal: **aktif** — channel **{login}**, segmen tersinkron: {count}.',
    'ssync.statusOff': 'ℹ️ Sinkronisasi jadwal: nonaktif. Aktifkan: `/streamsync stan:ON`.',
    'ssync.noLogin': '⚠️ Tidak ada channel Twitch — isi opsi `login` (TWITCH_CHANNEL belum diatur).',
    'ssync.noCreds':
      '🔑 Kunci Twitch belum ada (TWITCH_CLIENT_ID/SECRET) — fitur siap dan akan jalan begitu kunci ditambahkan.',
  },
};
