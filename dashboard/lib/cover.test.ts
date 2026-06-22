// Rygiel proxowania okładek (proxied · coverFallbacks). `proxied` decyduje, czy URL idzie przez
// proxy `/api/img` (ze strażnikiem SSRF) — z WYJĄTKIEM `data:` (inline, proxowanie by je zepsuło).
// Regresja = albo data: trafia do proxy (zepsuty obraz), albo URL bez enkodowania (zła ścieżka / wektor).
// coverFallbacks buduje uporządkowany łańcuch zapasowy zawsze kończący się placeholderem.
import { describe, expect, it } from 'vitest';
import { coverFallbacks, proxied } from './cover';
import type { Game } from './data';

const game = (o: {
  cover_url?: string | null;
  platform?: string;
  platform_app_id?: string;
}): Game => o as unknown as Game;

describe('proxied — routing URL okładki', () => {
  it('data: URI przechodzi BEZ proxy (inline, nie da się SSRF-ować)', () => {
    const d = 'data:image/svg+xml;utf8,<svg/>';
    expect(proxied(d)).toBe(d);
  });

  it('http(s) → przez /api/img z zakodowanym parametrem u', () => {
    expect(proxied('https://x.com/a.jpg')).toBe('/api/img?u=https%3A%2F%2Fx.com%2Fa.jpg');
  });

  it('enkoduje znaki specjalne (? & spacja) — brak wstrzyknięcia do query', () => {
    expect(proxied('https://x.com/a.jpg?w=1&h=2 z')).toBe(
      '/api/img?u=https%3A%2F%2Fx.com%2Fa.jpg%3Fw%3D1%26h%3D2%20z',
    );
  });
});

const isPlaceholder = (s: string) => s.startsWith('data:image/svg+xml');

describe('coverFallbacks — uporządkowany łańcuch zapasowy', () => {
  it('steam + cover_url: cover → steam 600x900 → steam header → placeholder', () => {
    const list = coverFallbacks(
      game({ cover_url: 'https://cdn/cover.jpg', platform: 'steam', platform_app_id: '440' }),
    );
    expect(list[0]).toBe(proxied('https://cdn/cover.jpg'));
    expect(list[1]).toContain('library_600x900_2x.jpg');
    expect(list[1]).toContain('440');
    expect(list[2]).toContain('header.jpg');
    expect(isPlaceholder(list[3])).toBe(true);
    expect(list).toHaveLength(4);
  });

  it('zawsze kończy się placeholderem', () => {
    for (const g of [
      game({}),
      game({ cover_url: 'https://c/x.jpg' }),
      game({ platform: 'steam', platform_app_id: '1' }),
    ]) {
      const list = coverFallbacks(g);
      expect(isPlaceholder(list.at(-1) as string)).toBe(true);
    }
  });

  it('brak okładki i nie-steam → sam placeholder', () => {
    const list = coverFallbacks(game({ platform: 'psn' }));
    expect(list).toHaveLength(1);
    expect(isPlaceholder(list[0])).toBe(true);
  });

  it('nie-steam z okładką → [proxied(cover), placeholder]', () => {
    const list = coverFallbacks(game({ cover_url: 'https://c/x.jpg', platform: 'gog' }));
    expect(list).toEqual([proxied('https://c/x.jpg'), list[1]]);
    expect(isPlaceholder(list[1])).toBe(true);
  });

  it('bez duplikatów (dedup przez Set)', () => {
    const list = coverFallbacks(
      game({ cover_url: 'https://cdn/cover.jpg', platform: 'steam', platform_app_id: '440' }),
    );
    expect(new Set(list).size).toBe(list.length);
  });
});
