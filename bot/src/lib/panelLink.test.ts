import { describe, expect, it } from 'vitest';
import { panelUrl } from './panelLink.mts';

describe('panelUrl', () => {
  it('skleja bazę ze ścieżką (normalizuje slashe)', () => {
    expect(panelUrl('/ai', 'https://e-bot-dc.vercel.app')).toBe('https://e-bot-dc.vercel.app/ai');
    expect(panelUrl('/ai', 'https://e-bot-dc.vercel.app/')).toBe('https://e-bot-dc.vercel.app/ai');
    expect(panelUrl('gaming', 'https://x.dev')).toBe('https://x.dev/gaming');
  });

  it('bez DASHBOARD_URL lub przy nie-HTTP zwraca null (brak przycisku, zero breakage)', () => {
    expect(panelUrl('/ai', undefined)).toBeNull();
    expect(panelUrl('/ai', '')).toBeNull();
    expect(panelUrl('/ai', '   ')).toBeNull();
    expect(panelUrl('/ai', 'ftp://zly')).toBeNull();
  });
});
