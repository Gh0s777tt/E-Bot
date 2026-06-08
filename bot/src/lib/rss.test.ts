import { describe, expect, it } from 'vitest';
import { decodeEntities, parseFeed } from './rss.mts';

describe('parseFeed (RSS/Atom)', () => {
  it('parsuje RSS <item> (guid, link, CDATA + encje)', () => {
    const xml = `<rss><channel>
      <item><title>Pierwszy</title><link>https://e.com/1</link><guid>g1</guid></item>
      <item><title><![CDATA[Drugi &amp; lepszy]]></title><link>https://e.com/2</link></item>
    </channel></rss>`;
    const items = parseFeed(xml);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ id: 'g1', title: 'Pierwszy', link: 'https://e.com/1' });
    expect(items[1].title).toBe('Drugi & lepszy');
  });

  it('parsuje Atom <entry> z link href', () => {
    const xml = `<feed><entry><title>Atom post</title><link href="https://e.com/a"/><id>id-a</id></entry></feed>`;
    const items = parseFeed(xml);
    expect(items[0]).toMatchObject({ id: 'id-a', title: 'Atom post', link: 'https://e.com/a' });
  });

  it('pomija wpisy bez tytułu i pusty/zepsuty feed', () => {
    expect(parseFeed('')).toEqual([]);
    expect(parseFeed('<rss><channel><item><link>https://x</link></item></channel></rss>')).toEqual(
      [],
    );
  });

  it('decodeEntities zdejmuje tagi i dekoduje encje', () => {
    expect(decodeEntities('<b>Hej</b> &amp; &lt;ok&gt;')).toBe('Hej & <ok>');
  });
});
