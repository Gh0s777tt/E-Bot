import { describe, expect, it } from 'vitest';
import { detectHealthIssues, type HealthInput, parseBotOnline } from './healthIssues';

const BASE: HealthInput = {
  botOnline: true,
  cloudOn: true,
  guildOk: true,
  channelIds: new Set(['c1', 'c2']),
  roleIds: new Set(['r1']),
  refs: [],
  needsConfig: 0,
  botPerms: null,
  permChecks: [],
};

const MANAGE_ROLES = 1n << 28n;
const ADMIN = 1n << 3n;

const ref = (over: Partial<HealthInput['refs'][number]>) => ({
  id: 'welcome',
  label: 'Powitania',
  href: '/welcome',
  enabled: true,
  channels: [],
  roles: [],
  ...over,
});

describe('detectHealthIssues', () => {
  it('wszystko OK → pusta lista (baner ukryty)', () => {
    expect(detectHealthIssues(BASE)).toEqual([]);
  });

  it('bot offline i chmura off → dwa błędy z linkiem do /diagnostics', () => {
    const out = detectHealthIssues({ ...BASE, botOnline: false, cloudOn: false });
    expect(out.map((i) => i.id)).toEqual(['bot-offline', 'cloud-off']);
    expect(out.every((i) => i.severity === 'error' && i.href === '/diagnostics')).toBe(true);
  });

  it('włączony moduł ze skasowanym kanałem → warning z etykietą i href modułu', () => {
    const out = detectHealthIssues({ ...BASE, refs: [ref({ channels: ['dead'] })] });
    expect(out).toEqual([
      {
        id: 'welcome-channel-missing',
        severity: 'warning',
        msgKey: 'ui.health.channelMissing',
        module: 'Powitania',
        href: '/welcome',
      },
    ]);
  });

  it('skasowana rola → osobny warning roleMissing', () => {
    const out = detectHealthIssues({ ...BASE, refs: [ref({ roles: ['gone'] })] });
    expect(out[0]?.msgKey).toBe('ui.health.roleMissing');
  });

  it('puste ID i wyłączone moduły są pomijane (to nie „usunięte")', () => {
    const refs = [
      ref({ channels: [''] }),
      ref({ id: 'logging', enabled: false, channels: ['dead'] }),
    ];
    expect(detectHealthIssues({ ...BASE, refs })).toEqual([]);
  });

  it('bez świeżej GuildMeta nie ocenia kanałów/ról (zero fałszywych alarmów)', () => {
    const out = detectHealthIssues({
      ...BASE,
      guildOk: false,
      refs: [ref({ channels: ['dead'] })],
    });
    expect(out).toEqual([]);
  });

  it('needsConfig > 0 → info z liczbą i linkiem do /modules', () => {
    const out = detectHealthIssues({ ...BASE, needsConfig: 3 });
    expect(out).toEqual([
      {
        id: 'needs-config',
        severity: 'info',
        msgKey: 'ui.health.needsConfig',
        n: 3,
        href: '/modules',
      },
    ]);
  });

  it('brak wymaganego uprawnienia przy włączonym module → warning z etykietą uprawnienia', () => {
    const out = detectHealthIssues({
      ...BASE,
      botPerms: 0n,
      permChecks: [{ bit: MANAGE_ROLES, label: 'Zarządzaj rolami', enabled: true }],
    });
    expect(out).toEqual([
      {
        id: `perm-missing-${MANAGE_ROLES.toString()}`,
        severity: 'warning',
        msgKey: 'ui.health.permMissing',
        module: 'Zarządzaj rolami',
        href: '/diagnostics',
      },
    ]);
  });

  it('uprawnienia: Administrator wszystko pokrywa; wyłączone moduły i botPerms=null pomijane', () => {
    const check = { bit: MANAGE_ROLES, label: 'Zarządzaj rolami', enabled: true };
    expect(detectHealthIssues({ ...BASE, botPerms: ADMIN, permChecks: [check] })).toEqual([]);
    expect(
      detectHealthIssues({ ...BASE, botPerms: 0n, permChecks: [{ ...check, enabled: false }] }),
    ).toEqual([]);
    expect(detectHealthIssues({ ...BASE, botPerms: null, permChecks: [check] })).toEqual([]);
    expect(detectHealthIssues({ ...BASE, botPerms: MANAGE_ROLES, permChecks: [check] })).toEqual(
      [],
    );
  });

  it('sortowanie: error przed warning przed info', () => {
    const out = detectHealthIssues({
      ...BASE,
      botOnline: false,
      needsConfig: 1,
      refs: [ref({ channels: ['dead'] })],
    });
    expect(out.map((i) => i.severity)).toEqual(['error', 'warning', 'info']);
  });
});

describe('parseBotOnline', () => {
  const now = 1_000_000_000;
  it('świeży heartbeat (<120 s) → online', () => {
    expect(parseBotOnline(JSON.stringify({ online: true, ts: now - 60_000 }), now)).toBe(true);
  });
  it('przeterminowany, offline, zepsuty JSON lub brak → offline', () => {
    expect(parseBotOnline(JSON.stringify({ online: true, ts: now - 121_000 }), now)).toBe(false);
    expect(parseBotOnline(JSON.stringify({ online: false, ts: now }), now)).toBe(false);
    expect(parseBotOnline('nie-json', now)).toBe(false);
    expect(parseBotOnline(null, now)).toBe(false);
  });
});
