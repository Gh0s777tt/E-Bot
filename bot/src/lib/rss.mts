// Czysty parser RSS/Atom (bez zależności runtime → testowalny). Używany przez creator/social.mts.
export type FeedItem = { id: string; title: string; link: string };

export function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

function firstTag(block: string, tag: string): string {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(block);
  return m?.[1] ? decodeEntities(m[1]) : '';
}

function atomLink(block: string): string {
  const m = /<link[^>]*href="([^"]+)"/i.exec(block);
  return m?.[1] ?? '';
}

export function parseFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
  for (const b of blocks.slice(0, 10)) {
    const title = firstTag(b, 'title');
    let link = firstTag(b, 'link');
    if (!link || link.length > 500 || !/^https?:/i.test(link)) link = atomLink(b);
    const guid = firstTag(b, 'guid') || firstTag(b, 'id') || link || title;
    if (title) items.push({ id: guid.slice(0, 200), title: title.slice(0, 300), link });
  }
  return items;
}
