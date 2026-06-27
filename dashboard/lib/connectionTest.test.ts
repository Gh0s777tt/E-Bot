// Rygiel opakowania testu połączenia (timed) — mierzy latencję i NIE wywala się na wyjątku
// (timeout/sieć) → zwraca ok:false z komunikatem. Logika deterministyczna, bez sieci.
import { describe, expect, it } from 'vitest';
import { timed } from './connectionTest';

describe('timed', () => {
  it('sukces probe → ok:true, przenosi detail, ms ≥ 0', async () => {
    const r = await timed('X', async () => ({ ok: true, detail: 'pong' }));
    expect(r.name).toBe('X');
    expect(r.ok).toBe(true);
    expect(r.detail).toBe('pong');
    expect(r.ms).toBeGreaterThanOrEqual(0);
  });

  it('probe ok:false → przenosi ok:false + detail', async () => {
    const r = await timed('Y', async () => ({ ok: false, detail: 'HTTP 401' }));
    expect(r.ok).toBe(false);
    expect(r.detail).toBe('HTTP 401');
  });

  it('wyjątek w probe → ok:false, komunikat błędu (bot się nie wywala)', async () => {
    const r = await timed('Z', async () => {
      throw new Error('boom-timeout');
    });
    expect(r.ok).toBe(false);
    expect(r.detail).toContain('boom-timeout');
    expect(r.ms).toBeGreaterThanOrEqual(0);
  });

  it('przycina długi komunikat błędu do 120 znaków', async () => {
    const r = await timed('Z', async () => {
      throw new Error('e'.repeat(500));
    });
    expect(r.detail.length).toBe(120);
  });
});
