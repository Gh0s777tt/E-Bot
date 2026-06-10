// Słownik /imageonly (kanały tylko-obrazki) — 14 języków. {channel}{channels}{user} = placeholdery.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const IMGONLY_STRINGS: Record<Locale, Dict> = {
  pl: {
    'imgonly.added':
      '🖼️ {channel} jest teraz kanałem tylko-obrazki (tekst bez załącznika będzie kasowany).',
    'imgonly.removedCfg': '✅ {channel} nie jest już kanałem tylko-obrazki.',
    'imgonly.list': '🖼️ Kanały tylko-obrazki: {channels}',
    'imgonly.listEmpty': 'ℹ️ Brak kanałów tylko-obrazki.',
    'imgonly.notice': '🖼️ {user} — ten kanał jest tylko na obrazki i wideo!',
  },
  en: {
    'imgonly.added': '🖼️ {channel} is now image-only (text without an attachment will be deleted).',
    'imgonly.removedCfg': '✅ {channel} is no longer image-only.',
    'imgonly.list': '🖼️ Image-only channels: {channels}',
    'imgonly.listEmpty': 'ℹ️ No image-only channels.',
    'imgonly.notice': '🖼️ {user} — this channel is for images and videos only!',
  },
  de: {
    'imgonly.added': '🖼️ {channel} ist jetzt nur für Bilder (Text ohne Anhang wird gelöscht).',
    'imgonly.removedCfg': '✅ {channel} ist kein Nur-Bilder-Kanal mehr.',
    'imgonly.list': '🖼️ Nur-Bilder-Kanäle: {channels}',
    'imgonly.listEmpty': 'ℹ️ Keine Nur-Bilder-Kanäle.',
    'imgonly.notice': '🖼️ {user} — dieser Kanal ist nur für Bilder und Videos!',
  },
  es: {
    'imgonly.added': '🖼️ {channel} ahora es solo-imágenes (el texto sin adjunto se eliminará).',
    'imgonly.removedCfg': '✅ {channel} ya no es solo-imágenes.',
    'imgonly.list': '🖼️ Canales solo-imágenes: {channels}',
    'imgonly.listEmpty': 'ℹ️ No hay canales solo-imágenes.',
    'imgonly.notice': '🖼️ {user} — ¡este canal es solo para imágenes y vídeos!',
  },
  it: {
    'imgonly.added': '🖼️ {channel} ora è solo-immagini (il testo senza allegato verrà eliminato).',
    'imgonly.removedCfg': '✅ {channel} non è più solo-immagini.',
    'imgonly.list': '🖼️ Canali solo-immagini: {channels}',
    'imgonly.listEmpty': 'ℹ️ Nessun canale solo-immagini.',
    'imgonly.notice': '🖼️ {user} — questo canale è solo per immagini e video!',
  },
  fr: {
    'imgonly.added':
      '🖼️ {channel} est désormais réservé aux images (le texte sans pièce jointe sera supprimé).',
    'imgonly.removedCfg': "✅ {channel} n'est plus réservé aux images.",
    'imgonly.list': '🖼️ Salons réservés aux images : {channels}',
    'imgonly.listEmpty': 'ℹ️ Aucun salon réservé aux images.',
    'imgonly.notice': '🖼️ {user} — ce salon est réservé aux images et vidéos !',
  },
  pt: {
    'imgonly.added': '🖼️ {channel} agora é só-imagens (texto sem anexo será apagado).',
    'imgonly.removedCfg': '✅ {channel} não é mais só-imagens.',
    'imgonly.list': '🖼️ Canais só-imagens: {channels}',
    'imgonly.listEmpty': 'ℹ️ Nenhum canal só-imagens.',
    'imgonly.notice': '🖼️ {user} — este canal é só para imagens e vídeos!',
  },
  zh: {
    'imgonly.added': '🖼️ {channel} 现在是纯图频道（无附件的文字会被删除）。',
    'imgonly.removedCfg': '✅ {channel} 不再是纯图频道。',
    'imgonly.list': '🖼️ 纯图频道：{channels}',
    'imgonly.listEmpty': 'ℹ️ 没有纯图频道。',
    'imgonly.notice': '🖼️ {user} — 此频道仅限图片和视频！',
  },
  ko: {
    'imgonly.added': '🖼️ {channel}은(는) 이제 이미지 전용입니다 (첨부 없는 텍스트는 삭제됩니다).',
    'imgonly.removedCfg': '✅ {channel}은(는) 더 이상 이미지 전용이 아닙니다.',
    'imgonly.list': '🖼️ 이미지 전용 채널: {channels}',
    'imgonly.listEmpty': 'ℹ️ 이미지 전용 채널이 없습니다.',
    'imgonly.notice': '🖼️ {user} — 이 채널은 이미지와 영상 전용입니다!',
  },
  ru: {
    'imgonly.added': '🖼️ {channel} теперь только для изображений (текст без вложения будет удалён).',
    'imgonly.removedCfg': '✅ {channel} больше не только для изображений.',
    'imgonly.list': '🖼️ Каналы только для изображений: {channels}',
    'imgonly.listEmpty': 'ℹ️ Нет каналов только для изображений.',
    'imgonly.notice': '🖼️ {user} — этот канал только для изображений и видео!',
  },
  uk: {
    'imgonly.added': '🖼️ {channel} тепер лише для зображень (текст без вкладення буде видалено).',
    'imgonly.removedCfg': '✅ {channel} більше не лише для зображень.',
    'imgonly.list': '🖼️ Канали лише для зображень: {channels}',
    'imgonly.listEmpty': 'ℹ️ Немає каналів лише для зображень.',
    'imgonly.notice': '🖼️ {user} — цей канал лише для зображень і відео!',
  },
  ja: {
    'imgonly.added': '🖼️ {channel} は画像専用になりました（添付なしのテキストは削除されます）。',
    'imgonly.removedCfg': '✅ {channel} は画像専用ではなくなりました。',
    'imgonly.list': '🖼️ 画像専用チャンネル：{channels}',
    'imgonly.listEmpty': 'ℹ️ 画像専用チャンネルはありません。',
    'imgonly.notice': '🖼️ {user} — このチャンネルは画像と動画専用です！',
  },
  ar: {
    'imgonly.added': '🖼️ أصبحت {channel} قناة للصور فقط (سيتم حذف النص بدون مرفق).',
    'imgonly.removedCfg': '✅ لم تعد {channel} قناة للصور فقط.',
    'imgonly.list': '🖼️ قنوات الصور فقط: {channels}',
    'imgonly.listEmpty': 'ℹ️ لا توجد قنوات للصور فقط.',
    'imgonly.notice': '🖼️ {user} — هذه القناة للصور والفيديو فقط!',
  },
  id: {
    'imgonly.added': '🖼️ {channel} sekarang khusus gambar (teks tanpa lampiran akan dihapus).',
    'imgonly.removedCfg': '✅ {channel} bukan lagi khusus gambar.',
    'imgonly.list': '🖼️ Kanal khusus gambar: {channels}',
    'imgonly.listEmpty': 'ℹ️ Tidak ada kanal khusus gambar.',
    'imgonly.notice': '🖼️ {user} — kanal ini hanya untuk gambar dan video!',
  },
};
