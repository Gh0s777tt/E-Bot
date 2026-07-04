import { describe, expect, it } from 'vitest';
import { authorize, isPublicPath } from './authz';

describe('isPublicPath — bramka publicznych tras', () => {
  it('przepuszcza znane publiczne ścieżki', () => {
    for (const p of [
      '/login',
      '/',
      '/wiki',
      '/wiki/komendy',
      '/api/auth/callback',
      '/api/img?u=x',
      '/api/twitch/eventsub',
      '/api/kofi',
      '/api/hook',
      '/api/sentry',
      '/api/health',
      '/api/health/check',
      '/api/bot-status',
      '/p/leaderboard',
      '/p/u/123',
      '/_next/static/x.js',
      '/favicon.ico',
      '/logo.png',
      '/font.woff2',
    ]) {
      expect(isPublicPath(p), p).toBe(true);
    }
  });

  it('NIE przepuszcza chronionych tras panelu i API', () => {
    for (const p of [
      '/settings',
      '/diagnostics',
      '/moderation',
      '/api/settings',
      '/api/automod',
      '/api/billing/checkout',
      '/api/dev/reset',
      '/api/panel-staff',
      '/api/config/import',
    ]) {
      expect(isPublicPath(p), p).toBe(false);
    }
  });

  it('REGRESJA: /api/kofi jest EXACT — /api/kofi-config zostaje chronione', () => {
    expect(isPublicPath('/api/kofi')).toBe(true);
    expect(isPublicPath('/api/kofi-config')).toBe(false);
  });

  it('REGRESJA: /api/hook EXACT — /api/hook-something zostaje chronione', () => {
    expect(isPublicPath('/api/hook')).toBe(true);
    expect(isPublicPath('/api/hookzzz')).toBe(false);
  });

  it('REGRESJA: /api/bot-status EXACT, ale /api/health prefix (cron /check)', () => {
    expect(isPublicPath('/api/bot-status')).toBe(true);
    expect(isPublicPath('/api/bot-status-x')).toBe(false);
    expect(isPublicPath('/api/health/check')).toBe(true);
  });
});

describe('authorize — decyzja autoryzacji', () => {
  const req = (o: Partial<Parameters<typeof authorize>[0]>) =>
    authorize({ pathname: '/settings', method: 'GET', hasSession: true, role: 'admin', ...o });

  it('publiczna ścieżka → "public" niezależnie od sesji', () => {
    expect(req({ pathname: '/login', hasSession: false, role: undefined })).toBe('public');
    expect(req({ pathname: '/p/u/1', hasSession: false, role: undefined })).toBe('public');
  });

  it('chroniona bez sesji → "redirect-login"', () => {
    expect(req({ pathname: '/settings', hasSession: false, role: undefined })).toBe(
      'redirect-login',
    );
    expect(req({ pathname: '/api/automod', hasSession: false, role: undefined })).toBe(
      'redirect-login',
    );
  });

  it('admin (i brak roli = legacy/owner) → "allow" wszędzie', () => {
    expect(req({ role: 'admin' })).toBe('allow');
    expect(req({ role: undefined })).toBe('allow'); // legacy sesja bez pola role
    expect(req({ pathname: '/api/panel-staff', method: 'POST', role: 'admin' })).toBe('allow');
    expect(req({ pathname: '/api/config/import', method: 'POST', role: undefined })).toBe('allow');
  });

  it('viewer: odczyt OK, mutacja API → 403', () => {
    expect(req({ role: 'viewer', method: 'GET', pathname: '/api/automod' })).toBe('allow');
    const denied = req({ role: 'viewer', method: 'POST', pathname: '/api/automod' });
    expect(denied).toMatchObject({ status: 403 });
  });

  it('viewer: mutacja STRONY (nie /api) jest dozwolona (blokada tylko na /api mutacjach)', () => {
    expect(req({ role: 'viewer', method: 'POST', pathname: '/moderation' })).toBe('allow');
  });

  it('sekcje admin-only (panel-staff, config/import) → 403 dla viewera i staffa, każdą metodą', () => {
    for (const role of ['viewer', 'staff']) {
      expect(req({ role, method: 'GET', pathname: '/api/panel-staff' })).toMatchObject({
        status: 403,
      });
      expect(req({ role, method: 'POST', pathname: '/api/config/import' })).toMatchObject({
        status: 403,
      });
    }
  });

  it('nie-admin, nie-viewer (staff) na zwykłej mutacji API → allow (tylko viewer jest read-only)', () => {
    expect(req({ role: 'staff', method: 'POST', pathname: '/api/automod' })).toBe('allow');
  });
});
