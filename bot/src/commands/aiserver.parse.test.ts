// Rygiel architekta serwera AI (parsePlan + pickModules). parsePlan wyłuskuje JSON z odpowiedzi modelu
// (nawet z prozą wokół) i wymaga tablicy categories; pickModules waliduje polecane moduły względem
// whitelisty (anty-halucynacja), dedupuje i ogranicza do 8. Czyste funkcje.
import { describe, expect, it } from 'vitest';
import { parsePlan, pickModules, RECOMMENDABLE_MODULES } from './aiserver.mts';

describe('parsePlan', () => {
  it('poprawny JSON z categories → obiekt', () => {
    const p = parsePlan('{"categories":[{"name":"X","channels":[]}],"roles":[]}');
    expect(p?.categories?.[0]?.name).toBe('X');
  });

  it('wyłuskuje JSON spośród prozy modelu (markdown/komentarz)', () => {
    const p = parsePlan('Sure! Here:\n```json\n{"categories":[{"name":"Y"}]}\n``` enjoy');
    expect(p?.categories?.[0]?.name).toBe('Y');
  });

  it('brak nawiasu / zły JSON → null', () => {
    expect(parsePlan('brak json')).toBeNull();
    expect(parsePlan('{nie-json')).toBeNull();
  });

  it('JSON bez tablicy categories → null', () => {
    expect(parsePlan('{"roles":[{"name":"A"}]}')).toBeNull();
  });
});

describe('pickModules — whitelista + dedup + cap', () => {
  const wl = ['leveling', 'welcome', 'economy'];

  it('przepuszcza tylko klucze z whitelisty', () => {
    expect(pickModules(['leveling', 'zmyslony', 'economy'], wl)).toEqual(['leveling', 'economy']);
  });

  it('case-insensitive + trim', () => {
    expect(pickModules(['  Leveling ', 'WELCOME'], wl)).toEqual(['leveling', 'welcome']);
  });

  it('deduplikuje', () => {
    expect(pickModules(['leveling', 'leveling', 'welcome'], wl)).toEqual(['leveling', 'welcome']);
  });

  it('nie-tablica → []', () => {
    expect(pickModules('leveling', wl)).toEqual([]);
    expect(pickModules(undefined, wl)).toEqual([]);
  });

  it('ogranicza do 8 (względem realnej whitelisty)', () => {
    const many = [...RECOMMENDABLE_MODULES];
    expect(pickModules(many, RECOMMENDABLE_MODULES).length).toBe(8);
  });
});
