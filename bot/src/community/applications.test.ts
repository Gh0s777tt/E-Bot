// Rygiel aplikacji do ekipy (resolveApps · applyEnabled) — katalog aplikacji + bramka włączenia.
// KLUCZ: pytania kapowane do 5 (twardy limit Discorda: modal ma max 5 pól tekstowych — przekroczenie
// = Discord odrzuca modal); pola aplikacji fallbackują na top-level config; applyEnabled wymaga kanału
// recenzji (inaczej zgłoszenia trafiają donikąd). Config per-serwer z realnego SQLite (DATABASE_PATH).
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setSettingLocal } from '../lib/db.mts';
import { applyEnabled, resolveApps } from './applications.mts';

const DB = path.join(tmpdir(), `ebot-apps-${process.pid}.db`);
const G = 'G';
const setCfg = (obj: unknown) => setSettingLocal('applications_config', JSON.stringify(obj));

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
  if (existsSync(DB)) rmSync(DB);
});
afterAll(() => {
  if (existsSync(DB)) rmSync(DB);
  delete process.env.DATABASE_PATH;
});
beforeEach(() => {
  setSettingLocal('applications_config', '');
});

describe('resolveApps — katalog aplikacji', () => {
  it('brak configu → jedna aplikacja „default" z domyślnymi pytaniami', () => {
    const apps = resolveApps(G);
    expect(apps).toHaveLength(1);
    expect(apps[0].id).toBe('default');
    expect(apps[0].questions.length).toBeGreaterThan(0);
  });

  it('config 2.0: pola fallbackują na top-level (kanał/rola) + domyślne label/style', () => {
    setCfg({
      reviewChannelId: 'CH',
      roleId: 'R',
      applications: [{ id: 'a1', questions: ['q'] }],
    });
    const [a] = resolveApps(G);
    expect(a.id).toBe('a1');
    expect(a.label).toBe('Aplikuj'); // default
    expect(a.style).toBe('primary'); // default
    expect(a.reviewChannelId).toBe('CH'); // fallback na top-level
    expect(a.acceptRoleId).toBe('R');
  });

  it('RYGIEL kapu 5 pytań (limit modala Discorda)', () => {
    const many = Array.from({ length: 8 }, (_, i) => `pytanie ${i}`);
    setCfg({ applications: [{ id: 'a1', reviewChannelId: 'CH', questions: many }] });
    expect(resolveApps(G)[0].questions).toHaveLength(5);
  });
});

describe('applyEnabled — bramka włączenia', () => {
  it('włączone + aplikacja z kanałem recenzji → true', () => {
    setCfg({
      enabled: true,
      applications: [{ id: 'a1', reviewChannelId: 'CH', questions: ['q'] }],
    });
    expect(applyEnabled(G)).toBe(true);
  });

  it('RYGIEL: włączone, ale BRAK kanału recenzji → false (zgłoszenia trafiałyby donikąd)', () => {
    setCfg({ enabled: true, reviewChannelId: '', applications: [{ id: 'a1', questions: ['q'] }] });
    expect(applyEnabled(G)).toBe(false);
  });

  it('wyłączone → false', () => {
    setCfg({ enabled: false, reviewChannelId: 'CH' });
    expect(applyEnabled(G)).toBe(false);
  });
});
