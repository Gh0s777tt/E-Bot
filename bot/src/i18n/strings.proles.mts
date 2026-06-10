// Słownik /liverole + /vanityrole (role z obecności) — 14 języków. {role}{phrase} = placeholdery.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const PROLES_STRINGS: Record<Locale, Dict> = {
  pl: {
    'proles.noIntent':
      '🟣 Presence Intent jest wyłączony — funkcja gotowa, ale uśpiona. Włącz **Presence Intent** w Discord Dev Portal i ustaw `PRESENCE_INTENT=1` na hostingu.',
    'proles.needRole': '⚠️ Przy włączaniu podaj opcję `rola`.',
    'proles.reqSuffix': ' (tylko dla posiadaczy {role})',
    'lvrole.on': '🔴 Live-rola włączona: streamujący dostają {role}, po streamie rola znika.',
    'lvrole.off': '✅ Live-rola wyłączona.',
    'lvrole.statusOn': '🔴 Live-rola: **włączona** — {role}.',
    'lvrole.statusOff': 'ℹ️ Live-rola: wyłączona. Włącz: `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 Vanity-rola włączona: {role} za „{phrase}" w statusie.',
    'vanity.off': '✅ Vanity-rola wyłączona.',
    'vanity.statusOn': '🟣 Vanity-rola: **włączona** — {role} za „{phrase}" w statusie.',
    'vanity.statusOff': 'ℹ️ Vanity-rola: wyłączona. Włącz: `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ Przy włączaniu podaj opcje `rola` i `fraza`.',
  },
  en: {
    'proles.noIntent':
      '🟣 Presence Intent is off — feature is ready but dormant. Enable **Presence Intent** in the Discord Dev Portal and set `PRESENCE_INTENT=1` on your hosting.',
    'proles.needRole': '⚠️ Provide the `rola` option when enabling.',
    'proles.reqSuffix': ' (only for holders of {role})',
    'lvrole.on': '🔴 Live role enabled: streamers get {role}; it is removed after the stream.',
    'lvrole.off': '✅ Live role disabled.',
    'lvrole.statusOn': '🔴 Live role: **enabled** — {role}.',
    'lvrole.statusOff': 'ℹ️ Live role: disabled. Enable: `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 Vanity role enabled: {role} for “{phrase}” in the status.',
    'vanity.off': '✅ Vanity role disabled.',
    'vanity.statusOn': '🟣 Vanity role: **enabled** — {role} for “{phrase}” in the status.',
    'vanity.statusOff': 'ℹ️ Vanity role: disabled. Enable: `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ Provide the `rola` and `fraza` options when enabling.',
  },
  de: {
    'proles.noIntent':
      '🟣 Presence Intent ist aus — Funktion bereit, aber schlafend. Aktiviere **Presence Intent** im Discord Dev Portal und setze `PRESENCE_INTENT=1` beim Hosting.',
    'proles.needRole': '⚠️ Gib beim Aktivieren die Option `rola` an.',
    'proles.reqSuffix': ' (nur für Inhaber von {role})',
    'lvrole.on':
      '🔴 Live-Rolle aktiviert: Streamer erhalten {role}; nach dem Stream wird sie entfernt.',
    'lvrole.off': '✅ Live-Rolle deaktiviert.',
    'lvrole.statusOn': '🔴 Live-Rolle: **aktiv** — {role}.',
    'lvrole.statusOff': 'ℹ️ Live-Rolle: aus. Aktivieren: `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 Vanity-Rolle aktiviert: {role} für „{phrase}“ im Status.',
    'vanity.off': '✅ Vanity-Rolle deaktiviert.',
    'vanity.statusOn': '🟣 Vanity-Rolle: **aktiv** — {role} für „{phrase}“ im Status.',
    'vanity.statusOff': 'ℹ️ Vanity-Rolle: aus. Aktivieren: `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ Gib beim Aktivieren die Optionen `rola` und `fraza` an.',
  },
  es: {
    'proles.noIntent':
      '🟣 El Presence Intent está desactivado — la función está lista pero dormida. Activa **Presence Intent** en el Dev Portal de Discord y define `PRESENCE_INTENT=1` en el hosting.',
    'proles.needRole': '⚠️ Al activar, indica la opción `rola`.',
    'proles.reqSuffix': ' (solo para quienes tienen {role})',
    'lvrole.on': '🔴 Rol live activado: quienes transmiten reciben {role}; al terminar se retira.',
    'lvrole.off': '✅ Rol live desactivado.',
    'lvrole.statusOn': '🔴 Rol live: **activado** — {role}.',
    'lvrole.statusOff': 'ℹ️ Rol live: desactivado. Actívalo: `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 Rol vanity activado: {role} por «{phrase}» en el estado.',
    'vanity.off': '✅ Rol vanity desactivado.',
    'vanity.statusOn': '🟣 Rol vanity: **activado** — {role} por «{phrase}» en el estado.',
    'vanity.statusOff':
      'ℹ️ Rol vanity: desactivado. Actívalo: `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ Al activar, indica las opciones `rola` y `fraza`.',
  },
  it: {
    'proles.noIntent':
      '🟣 Il Presence Intent è disattivato — funzione pronta ma dormiente. Attiva **Presence Intent** nel Dev Portal di Discord e imposta `PRESENCE_INTENT=1` sull’hosting.',
    'proles.needRole': '⚠️ All’attivazione indica l’opzione `rola`.',
    'proles.reqSuffix': ' (solo per chi possiede {role})',
    'lvrole.on': '🔴 Ruolo live attivato: chi streamma riceve {role}; a fine stream viene rimosso.',
    'lvrole.off': '✅ Ruolo live disattivato.',
    'lvrole.statusOn': '🔴 Ruolo live: **attivo** — {role}.',
    'lvrole.statusOff': 'ℹ️ Ruolo live: disattivato. Attiva: `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 Ruolo vanity attivato: {role} per «{phrase}» nello stato.',
    'vanity.off': '✅ Ruolo vanity disattivato.',
    'vanity.statusOn': '🟣 Ruolo vanity: **attivo** — {role} per «{phrase}» nello stato.',
    'vanity.statusOff':
      'ℹ️ Ruolo vanity: disattivato. Attiva: `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ All’attivazione indica le opzioni `rola` e `fraza`.',
  },
  fr: {
    'proles.noIntent':
      '🟣 Le Presence Intent est désactivé — fonction prête mais en sommeil. Active **Presence Intent** dans le Dev Portal Discord et définis `PRESENCE_INTENT=1` sur l’hébergement.',
    'proles.needRole': '⚠️ À l’activation, renseigne l’option `rola`.',
    'proles.reqSuffix': ' (réservé aux détenteurs de {role})',
    'lvrole.on':
      '🔴 Rôle live activé : les streamers reçoivent {role} ; il est retiré après le stream.',
    'lvrole.off': '✅ Rôle live désactivé.',
    'lvrole.statusOn': '🔴 Rôle live : **activé** — {role}.',
    'lvrole.statusOff': 'ℹ️ Rôle live : désactivé. Activer : `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 Rôle vanity activé : {role} pour « {phrase} » dans le statut.',
    'vanity.off': '✅ Rôle vanity désactivé.',
    'vanity.statusOn': '🟣 Rôle vanity : **activé** — {role} pour « {phrase} » dans le statut.',
    'vanity.statusOff':
      'ℹ️ Rôle vanity : désactivé. Activer : `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ À l’activation, renseigne les options `rola` et `fraza`.',
  },
  pt: {
    'proles.noIntent':
      '🟣 O Presence Intent está desligado — função pronta, mas adormecida. Ative **Presence Intent** no Dev Portal do Discord e defina `PRESENCE_INTENT=1` na hospedagem.',
    'proles.needRole': '⚠️ Ao ativar, informe a opção `rola`.',
    'proles.reqSuffix': ' (apenas para quem tem {role})',
    'lvrole.on':
      '🔴 Cargo live ativado: quem transmite recebe {role}; ao terminar, ele é removido.',
    'lvrole.off': '✅ Cargo live desativado.',
    'lvrole.statusOn': '🔴 Cargo live: **ativado** — {role}.',
    'lvrole.statusOff': 'ℹ️ Cargo live: desativado. Ative: `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 Cargo vanity ativado: {role} por “{phrase}” no status.',
    'vanity.off': '✅ Cargo vanity desativado.',
    'vanity.statusOn': '🟣 Cargo vanity: **ativado** — {role} por “{phrase}” no status.',
    'vanity.statusOff': 'ℹ️ Cargo vanity: desativado. Ative: `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ Ao ativar, informe as opções `rola` e `fraza`.',
  },
  zh: {
    'proles.noIntent':
      '🟣 Presence Intent 已关闭 — 功能就绪但处于休眠。请在 Discord 开发者门户启用 **Presence Intent**，并在托管端设置 `PRESENCE_INTENT=1`。',
    'proles.needRole': '⚠️ 开启时请提供 `rola` 选项。',
    'proles.reqSuffix': '（仅限拥有 {role} 的成员）',
    'lvrole.on': '🔴 直播身份组已开启：直播中的成员获得 {role}，结束后自动移除。',
    'lvrole.off': '✅ 直播身份组已关闭。',
    'lvrole.statusOn': '🔴 直播身份组：**已开启** — {role}。',
    'lvrole.statusOff': 'ℹ️ 直播身份组：已关闭。开启：`/liverole stan:ON rola:@…`。',
    'vanity.on': '🟣 状态身份组已开启：状态包含「{phrase}」即获得 {role}。',
    'vanity.off': '✅ 状态身份组已关闭。',
    'vanity.statusOn': '🟣 状态身份组：**已开启** — 状态含「{phrase}」获得 {role}。',
    'vanity.statusOff': 'ℹ️ 状态身份组：已关闭。开启：`/vanityrole stan:ON rola:@… fraza:…`。',
    'vanity.needRolePhrase': '⚠️ 开启时请提供 `rola` 和 `fraza` 选项。',
  },
  ko: {
    'proles.noIntent':
      '🟣 Presence Intent가 꺼져 있습니다 — 기능은 준비되었지만 휴면 상태입니다. Discord Dev Portal에서 **Presence Intent**를 켜고 호스팅에 `PRESENCE_INTENT=1`을 설정하세요.',
    'proles.needRole': '⚠️ 켤 때 `rola` 옵션을 지정하세요.',
    'proles.reqSuffix': ' ({role} 보유자 전용)',
    'lvrole.on':
      '🔴 라이브 역할 활성화: 방송 중인 멤버가 {role}을(를) 받고, 방송이 끝나면 제거됩니다.',
    'lvrole.off': '✅ 라이브 역할 비활성화.',
    'lvrole.statusOn': '🔴 라이브 역할: **켜짐** — {role}.',
    'lvrole.statusOff': 'ℹ️ 라이브 역할: 꺼짐. 켜기: `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 상태 역할 활성화: 상태에 “{phrase}”가 있으면 {role} 지급.',
    'vanity.off': '✅ 상태 역할 비활성화.',
    'vanity.statusOn': '🟣 상태 역할: **켜짐** — 상태의 “{phrase}”에 대해 {role}.',
    'vanity.statusOff': 'ℹ️ 상태 역할: 꺼짐. 켜기: `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ 켤 때 `rola`와 `fraza` 옵션을 지정하세요.',
  },
  ru: {
    'proles.noIntent':
      '🟣 Presence Intent выключен — функция готова, но спит. Включи **Presence Intent** в Dev Portal Discord и задай `PRESENCE_INTENT=1` на хостинге.',
    'proles.needRole': '⚠️ При включении укажи опцию `rola`.',
    'proles.reqSuffix': ' (только для обладателей {role})',
    'lvrole.on': '🔴 Live-роль включена: стримящие получают {role}; после стрима роль снимается.',
    'lvrole.off': '✅ Live-роль выключена.',
    'lvrole.statusOn': '🔴 Live-роль: **включена** — {role}.',
    'lvrole.statusOff': 'ℹ️ Live-роль: выключена. Включить: `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 Vanity-роль включена: {role} за «{phrase}» в статусе.',
    'vanity.off': '✅ Vanity-роль выключена.',
    'vanity.statusOn': '🟣 Vanity-роль: **включена** — {role} за «{phrase}» в статусе.',
    'vanity.statusOff':
      'ℹ️ Vanity-роль: выключена. Включить: `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ При включении укажи опции `rola` и `fraza`.',
  },
  uk: {
    'proles.noIntent':
      '🟣 Presence Intent вимкнено — функція готова, але спить. Увімкни **Presence Intent** у Dev Portal Discord і задай `PRESENCE_INTENT=1` на хостингу.',
    'proles.needRole': '⚠️ Під час увімкнення вкажи опцію `rola`.',
    'proles.reqSuffix': ' (лише для власників {role})',
    'lvrole.on': '🔴 Live-роль увімкнено: стримери отримують {role}; після стриму роль знімається.',
    'lvrole.off': '✅ Live-роль вимкнено.',
    'lvrole.statusOn': '🔴 Live-роль: **увімкнена** — {role}.',
    'lvrole.statusOff': 'ℹ️ Live-роль: вимкнена. Увімкнути: `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 Vanity-роль увімкнено: {role} за «{phrase}» у статусі.',
    'vanity.off': '✅ Vanity-роль вимкнено.',
    'vanity.statusOn': '🟣 Vanity-роль: **увімкнена** — {role} за «{phrase}» у статусі.',
    'vanity.statusOff':
      'ℹ️ Vanity-роль: вимкнена. Увімкнути: `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ Під час увімкнення вкажи опції `rola` і `fraza`.',
  },
  ja: {
    'proles.noIntent':
      '🟣 Presence Intent が無効です — 機能は準備済みですが休止中。Discord Dev Portal で **Presence Intent** を有効にし、ホスティングに `PRESENCE_INTENT=1` を設定してください。',
    'proles.needRole': '⚠️ 有効化時は `rola` オプションを指定してください。',
    'proles.reqSuffix': '（{role} 保持者のみ）',
    'lvrole.on': '🔴 ライブロール有効化：配信中のメンバーに {role} を付与し、終了後に外します。',
    'lvrole.off': '✅ ライブロールを無効化しました。',
    'lvrole.statusOn': '🔴 ライブロール：**有効** — {role}。',
    'lvrole.statusOff': 'ℹ️ ライブロール：無効。有効化：`/liverole stan:ON rola:@…`。',
    'vanity.on': '🟣 ステータスロール有効化：ステータスに「{phrase}」があれば {role} を付与。',
    'vanity.off': '✅ ステータスロールを無効化しました。',
    'vanity.statusOn': '🟣 ステータスロール：**有効** — 「{phrase}」に対して {role}。',
    'vanity.statusOff': 'ℹ️ ステータスロール：無効。有効化：`/vanityrole stan:ON rola:@… fraza:…`。',
    'vanity.needRolePhrase': '⚠️ 有効化時は `rola` と `fraza` を指定してください。',
  },
  ar: {
    'proles.noIntent':
      '🟣 Presence Intent معطّل — الميزة جاهزة لكنها نائمة. فعّل **Presence Intent** في بوابة مطوّري Discord واضبط `PRESENCE_INTENT=1` على الاستضافة.',
    'proles.needRole': '⚠️ عند التفعيل حدّد خيار `rola`.',
    'proles.reqSuffix': ' (لحاملي {role} فقط)',
    'lvrole.on': '🔴 تم تفعيل رتبة البث: من يبث يحصل على {role}، وتُزال بعد انتهاء البث.',
    'lvrole.off': '✅ تم إيقاف رتبة البث.',
    'lvrole.statusOn': '🔴 رتبة البث: **مفعّلة** — {role}.',
    'lvrole.statusOff': 'ℹ️ رتبة البث: متوقفة. التفعيل: `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 تم تفعيل رتبة الحالة: {role} مقابل «{phrase}» في الحالة.',
    'vanity.off': '✅ تم إيقاف رتبة الحالة.',
    'vanity.statusOn': '🟣 رتبة الحالة: **مفعّلة** — {role} مقابل «{phrase}».',
    'vanity.statusOff': 'ℹ️ رتبة الحالة: متوقفة. التفعيل: `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ عند التفعيل حدّد الخيارين `rola` و`fraza`.',
  },
  id: {
    'proles.noIntent':
      '🟣 Presence Intent mati — fitur siap tapi tertidur. Aktifkan **Presence Intent** di Dev Portal Discord dan setel `PRESENCE_INTENT=1` di hosting.',
    'proles.needRole': '⚠️ Saat mengaktifkan, isi opsi `rola`.',
    'proles.reqSuffix': ' (khusus pemilik {role})',
    'lvrole.on':
      '🔴 Role live diaktifkan: yang sedang live mendapat {role}; setelah selesai dicabut.',
    'lvrole.off': '✅ Role live dimatikan.',
    'lvrole.statusOn': '🔴 Role live: **aktif** — {role}.',
    'lvrole.statusOff': 'ℹ️ Role live: nonaktif. Aktifkan: `/liverole stan:ON rola:@…`.',
    'vanity.on': '🟣 Role vanity diaktifkan: {role} untuk “{phrase}” di status.',
    'vanity.off': '✅ Role vanity dimatikan.',
    'vanity.statusOn': '🟣 Role vanity: **aktif** — {role} untuk “{phrase}” di status.',
    'vanity.statusOff': 'ℹ️ Role vanity: nonaktif. Aktifkan: `/vanityrole stan:ON rola:@… fraza:…`.',
    'vanity.needRolePhrase': '⚠️ Saat mengaktifkan, isi opsi `rola` dan `fraza`.',
  },
};
