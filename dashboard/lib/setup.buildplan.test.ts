// Rygiel budowy planu Architekta (buildPlan) — zamienia wybrane bloki setupu na konkretny plan
// prowizjonowania (role/kategorie/kanały), który trafia do bota i TWORZY byty na serwerze. Regresja =
// powstanie złych kanałów/ról (np. ogłoszenia jako zwykły tekst, liczniki bez blokady pisania).
// Brak bloków → pusty plan (nic nie tworzymy). Mapowanie bierzemy z faktycznego wyniku, nie z hardcode.
import { describe, expect, it } from 'vitest';
import { buildPlan } from './setup';

describe('buildPlan — plan prowizjonowania Architekta', () => {
  it('brak bloków → pusty plan (nic nie tworzymy), id zachowane', () => {
    const p = buildPlan([], 'gaming');
    expect(p).toEqual({ id: 'gaming', roles: [], categories: [], channels: [] });
  });

  it('welcome/logs/tickets → kanały tekstowe o właściwych nazwach', () => {
    expect(buildPlan(['welcome'], 'x').channels).toEqual([{ name: 'powitania', kind: 'text' }]);
    expect(buildPlan(['tickets'], 'x').channels[0]).toMatchObject({
      name: 'pomoc-tickety',
      kind: 'text',
    });
  });

  it('RYGIEL typu kanału: announce to „announcement", nie zwykły tekst', () => {
    expect(buildPlan(['announce'], 'x').channels).toEqual([
      { name: 'ogłoszenia', kind: 'announcement' },
    ]);
  });

  it('RYGIEL liczników: kategoria + 2 kanały głosowe z lockSend i wspólnym categoryKey', () => {
    const p = buildPlan(['counters'], 'x');
    expect(p.categories).toEqual([{ key: 'stats', name: '📊 Statystyki' }]);
    expect(p.channels).toHaveLength(2);
    for (const ch of p.channels) {
      expect(ch.kind).toBe('voice');
      expect(ch.categoryKey).toBe('stats');
      expect(ch.lockSend).toBe(true);
    }
  });

  it('role: levelRoles = 3 role wyróżnione (hoist), muted = rola bez wyróżnienia', () => {
    const lvl = buildPlan(['levelRoles'], 'x').roles;
    expect(lvl).toHaveLength(3);
    expect(lvl.every((r) => r.hoist === true)).toBe(true);
    expect(buildPlan(['muted'], 'x').roles).toEqual([{ name: 'Muted' }]);
  });

  it('kilka bloków składa się w jeden plan', () => {
    const p = buildPlan(['welcome', 'tickets', 'muted'], 'community');
    expect(p.channels.map((c) => c.name)).toEqual(['powitania', 'pomoc-tickety']);
    expect(p.roles).toEqual([{ name: 'Muted' }]);
    expect(p.id).toBe('community');
  });
});
