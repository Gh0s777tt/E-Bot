// Słownik /emoji (dodaj/„ukradnij" emoji na serwer) — 14 języków. {emoji}{name} = placeholdery.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const EMOJI_STRINGS: Record<Locale, Dict> = {
  pl: {
    'emoji.noPerm':
      '❌ Do dodawania emoji potrzebne jest uprawnienie „Zarządzanie wyrażeniami" — dla Ciebie i dla bota.',
    'emoji.noSource': '❌ Podaj emoji do skradzenia, URL obrazka albo załącz plik.',
    'emoji.added': '✅ Dodano emoji {emoji} jako `:{name}:`',
    'emoji.failed':
      '❌ Nie udało się dodać. Możliwe powody: limit emoji serwera, zły obrazek lub plik za duży (maks. 256 KB).',
  },
  en: {
    'emoji.noPerm':
      '❌ Adding emojis needs the "Manage Expressions" permission — for you and the bot.',
    'emoji.noSource': '❌ Provide an emoji to steal, an image URL, or attach a file.',
    'emoji.added': '✅ Added emoji {emoji} as `:{name}:`',
    'emoji.failed':
      "❌ Couldn't add it. Possible reasons: server emoji limit, invalid image, or file too large (max 256 KB).",
  },
  de: {
    'emoji.noPerm':
      '❌ Zum Hinzufügen von Emojis wird die Berechtigung „Ausdrücke verwalten" benötigt — für dich und den Bot.',
    'emoji.noSource': '❌ Gib ein Emoji zum Stehlen, eine Bild-URL an oder hänge eine Datei an.',
    'emoji.added': '✅ Emoji {emoji} als `:{name}:` hinzugefügt',
    'emoji.failed':
      '❌ Konnte nicht hinzugefügt werden. Mögliche Gründe: Emoji-Limit des Servers, ungültiges Bild oder Datei zu groß (max. 256 KB).',
  },
  es: {
    'emoji.noPerm':
      '❌ Añadir emojis requiere el permiso «Gestionar expresiones», para ti y para el bot.',
    'emoji.noSource': '❌ Indica un emoji para robar, una URL de imagen o adjunta un archivo.',
    'emoji.added': '✅ Emoji {emoji} añadido como `:{name}:`',
    'emoji.failed':
      '❌ No se pudo añadir. Posibles motivos: límite de emojis del servidor, imagen no válida o archivo demasiado grande (máx. 256 KB).',
  },
  it: {
    'emoji.noPerm':
      '❌ Per aggiungere emoji serve il permesso «Gestisci espressioni», per te e per il bot.',
    'emoji.noSource': '❌ Fornisci un emoji da rubare, un URL immagine oppure allega un file.',
    'emoji.added': '✅ Emoji {emoji} aggiunto come `:{name}:`',
    'emoji.failed':
      '❌ Impossibile aggiungere. Possibili cause: limite emoji del server, immagine non valida o file troppo grande (max 256 KB).',
  },
  fr: {
    'emoji.noPerm':
      '❌ Ajouter des emojis nécessite la permission « Gérer les expressions » — pour toi et pour le bot.',
    'emoji.noSource': "❌ Fournis un emoji à voler, une URL d'image ou joins un fichier.",
    'emoji.added': '✅ Emoji {emoji} ajouté en tant que `:{name}:`',
    'emoji.failed':
      "❌ Ajout impossible. Raisons possibles : limite d'emojis du serveur, image invalide ou fichier trop volumineux (max 256 Ko).",
  },
  pt: {
    'emoji.noPerm':
      '❌ Adicionar emojis requer a permissão «Gerir expressões» — para ti e para o bot.',
    'emoji.noSource': '❌ Indica um emoji para roubar, um URL de imagem ou anexa um ficheiro.',
    'emoji.added': '✅ Emoji {emoji} adicionado como `:{name}:`',
    'emoji.failed':
      '❌ Não foi possível adicionar. Motivos possíveis: limite de emojis do servidor, imagem inválida ou ficheiro grande demais (máx. 256 KB).',
  },
  zh: {
    'emoji.noPerm': '❌ 添加表情需要「管理表情/表达」权限——你和机器人都需要。',
    'emoji.noSource': '❌ 请提供要窃取的表情、图片 URL，或附加一个文件。',
    'emoji.added': '✅ 已添加表情 {emoji}，名称为 `:{name}:`',
    'emoji.failed':
      '❌ 添加失败。可能原因：服务器表情已达上限、图片无效或文件过大（最大 256 KB）。',
  },
  ko: {
    'emoji.noPerm': '❌ 이모지를 추가하려면 "표현 관리" 권한이 필요합니다 — 당신과 봇 모두.',
    'emoji.noSource': '❌ 훔칠 이모지, 이미지 URL을 입력하거나 파일을 첨부하세요.',
    'emoji.added': '✅ 이모지 {emoji}을(를) `:{name}:`(으)로 추가했습니다',
    'emoji.failed':
      '❌ 추가하지 못했습니다. 원인: 서버 이모지 한도, 잘못된 이미지 또는 파일 용량 초과(최대 256 KB).',
  },
  ru: {
    'emoji.noPerm':
      '❌ Для добавления эмодзи нужно право «Управление выражениями» — у вас и у бота.',
    'emoji.noSource': '❌ Укажите эмодзи для кражи, URL изображения или прикрепите файл.',
    'emoji.added': '✅ Эмодзи {emoji} добавлено как `:{name}:`',
    'emoji.failed':
      '❌ Не удалось добавить. Возможные причины: лимит эмодзи сервера, некорректное изображение или слишком большой файл (макс. 256 КБ).',
  },
  uk: {
    'emoji.noPerm': '❌ Для додавання емодзі потрібне право «Керування виразами» — у вас і в бота.',
    'emoji.noSource': '❌ Вкажіть емодзі для крадіжки, URL зображення або прикріпіть файл.',
    'emoji.added': '✅ Емодзі {emoji} додано як `:{name}:`',
    'emoji.failed':
      '❌ Не вдалося додати. Можливі причини: ліміт емодзі сервера, некоректне зображення або завеликий файл (макс. 256 КБ).',
  },
  ja: {
    'emoji.noPerm': '❌ 絵文字の追加には「表現の管理」権限が必要です — あなたとボットの両方に。',
    'emoji.noSource': '❌ 盗む絵文字、画像URLを指定するか、ファイルを添付してください。',
    'emoji.added': '✅ 絵文字 {emoji} を `:{name}:` として追加しました',
    'emoji.failed':
      '❌ 追加できませんでした。原因: サーバーの絵文字上限、無効な画像、またはファイルが大きすぎます（最大256KB）。',
  },
  ar: {
    'emoji.noPerm': '❌ إضافة الإيموجي تتطلب صلاحية «إدارة التعبيرات» — لك وللبوت.',
    'emoji.noSource': '❌ قدّم إيموجي لسرقته أو رابط صورة أو أرفق ملفًا.',
    'emoji.added': '✅ تمت إضافة الإيموجي {emoji} باسم `:{name}:`',
    'emoji.failed':
      '❌ تعذّرت الإضافة. أسباب محتملة: حد الإيموجي في الخادم، صورة غير صالحة، أو ملف كبير جدًا (بحد أقصى 256 كيلوبايت).',
  },
  id: {
    'emoji.noPerm': '❌ Menambah emoji butuh izin "Kelola Ekspresi" — untukmu dan bot.',
    'emoji.noSource': '❌ Berikan emoji untuk dicuri, URL gambar, atau lampirkan file.',
    'emoji.added': '✅ Emoji {emoji} ditambahkan sebagai `:{name}:`',
    'emoji.failed':
      '❌ Gagal menambahkan. Kemungkinan: batas emoji server, gambar tidak valid, atau file terlalu besar (maks 256 KB).',
  },
};
