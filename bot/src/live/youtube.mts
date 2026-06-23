import type { LiveStatus } from './types.mts';

// Uwaga: search.list kosztuje ~100 jednostek/odczyt (limit domyślny 10k/dzień).
// Domyślnie wyłączone w notifierze (NOTIFY_YOUTUBE_INTERVAL_SEC=0).
// Czysty parser odpowiedzi search.list → LiveStatus. Brak `items[0]` = NIE live (kanał bez transmisji).
// Niezaufany kształt JSON (`?.` na każdym poziomie) → brak wyjątku, brakujące pola jako undefined.
export function parseYouTubeLive(j: unknown): LiveStatus {
  const item = (j as any)?.items?.[0];
  if (!item) return { platform: 'youtube', live: false };
  return {
    platform: 'youtube',
    live: true,
    title: item.snippet?.title,
    channelName: item.snippet?.channelTitle,
    url: `https://youtube.com/watch?v=${item.id?.videoId}`,
    thumbnail: item.snippet?.thumbnails?.high?.url,
  };
}

export async function getYouTubeLive(channelId: string): Promise<LiveStatus> {
  const key = process.env.YOUTUBE_API_KEY ?? '';
  const r = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${key}`,
  );
  return parseYouTubeLive(await r.json());
}
