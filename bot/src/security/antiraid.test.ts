// Test detekcji fali wejść anti-raid (detectWave) — czysty predykat wydzielony z handlera. Regresja =
// raid przepuszczony (za wysoki próg / złe okno) albo fałszywa fala (ban niewinnych przy zwykłym ruchu).
import { describe, expect, it } from 'vitest';
import {
  clusterSimilarNames,
  detectWave,
  isHoneypotHit,
  isKnownThreat,
  isSuspiciousName,
  largestNameCluster,
  nameSkeleton,
  pushThreat,
  scoreMember,
  threatHash,
} from './antiraid.mts';

const NOW = 100_000;
const at = (...ts: number[]) => ts.map((t) => ({ at: t }));

describe('detectWave — okno przesuwne + próg fali wejść', () => {
  it('poniżej progu → brak fali (zachowuje wpisy z okna)', () => {
    const r = detectWave(at(NOW, NOW - 1000), NOW, 10, 5);
    expect(r.isWave).toBe(false);
    expect(r.kept).toHaveLength(2);
  });

  it('próg osiągnięty (≥) → fala', () => {
    expect(detectWave(at(NOW, NOW, NOW, NOW, NOW), NOW, 10, 5).isWave).toBe(true);
    expect(detectWave(at(NOW, NOW, NOW, NOW), NOW, 10, 5).isWave).toBe(false); // 4 < 5
  });

  it('wpisy starsze niż okno są odcinane i nie liczą się do progu', () => {
    const old = NOW - 11_000; // poza oknem 10 s
    const r = detectWave(at(old, old, old, NOW, NOW), NOW, 10, 5);
    expect(r.kept).toHaveLength(2); // tylko 2 w oknie
    expect(r.isWave).toBe(false); // 2 < 5 → brak fali mimo 5 wejść łącznie
  });

  it('brzeg okna: wpis dokładnie na granicy (now - windowSec*1000) jest zachowany', () => {
    const edge = NOW - 10_000;
    const r = detectWave(at(edge), NOW, 10, 1);
    expect(r.kept).toHaveLength(1);
    expect(r.isWave).toBe(true);
  });

  it('joinCount ≤ 0 (detekcja wyłączona) → nigdy fala', () => {
    expect(detectWave(at(NOW, NOW, NOW, NOW, NOW, NOW), NOW, 10, 0).isWave).toBe(false);
  });
});

describe('clusterSimilarNames — armie botów po podobnych nazwach', () => {
  it('szkielet: cyfry → marker, znaki specjalne usunięte, lowercase', () => {
    expect(nameSkeleton('user_47120')).toBe('user#');
    expect(nameSkeleton('User_88213')).toBe('user#');
    expect(nameSkeleton('ShadowKnight')).toBe('shadowknight');
  });

  it('grupuje numerowaną armię, pomija zwykłe nicki', () => {
    const names = ['user_47120', 'user_88213', 'user_5', 'ShadowKnight', 'AlicePL'];
    const top = clusterSimilarNames(names)[0];
    expect(top.skeleton).toBe('user#');
    expect(top.size).toBe(3);
  });

  it('largestNameCluster zwraca rozmiar największego klastra', () => {
    expect(largestNameCluster(['raid001', 'raid002', 'raid003', 'Normalny'])).toBe(3);
  });

  it('same różne nicki → brak klastra (0)', () => {
    expect(largestNameCluster(['alice', 'bob', 'carol'])).toBe(0);
  });

  it('zbyt krótki rdzeń literowy nie sklejony (precyzja)', () => {
    expect(largestNameCluster(['ab1', 'ab2'])).toBe(0);
  });
});

describe('isHoneypotHit — kanał-pułapka', () => {
  it('trafienie: nie-uprzywilejowany pisze w kanale-pułapce', () =>
    expect(isHoneypotHit('honeyCh', 'honeyCh', false)).toBe(true));
  it('inny kanał → brak', () => expect(isHoneypotHit('honeyCh', 'innyCh', false)).toBe(false));
  it('uprzywilejowany (mod/test) → brak', () =>
    expect(isHoneypotHit('honeyCh', 'honeyCh', true)).toBe(false));
  it('brak skonfigurowanego kanału → brak', () =>
    expect(isHoneypotHit('', 'innyCh', false)).toBe(false));
});

describe('isSuspiciousName — auto-generowane nicki', () => {
  it('długi sufiks cyfr → podejrzany', () => {
    expect(isSuspiciousName('user_47120')).toBe(true);
    expect(isSuspiciousName('x_99887766')).toBe(true);
  });
  it('przewaga cyfr nad literami → podejrzany', () =>
    expect(isSuspiciousName('a12345')).toBe(true));
  it('zwykłe imię+rok → NIE podejrzany (precyzja)', () => {
    expect(isSuspiciousName('john2024')).toBe(false);
    expect(isSuspiciousName('AlicePL')).toBe(false);
  });
});

describe('scoreMember — threat-score 0-100', () => {
  it('świeże konto + brak awatara + podejrzana nazwa → wysoki', () => {
    const r = scoreMember({
      ageDays: 0.2,
      noAvatar: true,
      nameSuspicious: true,
      altAgeThresholdDays: 7,
      weighNoAvatar: true,
    });
    expect(r.score).toBe(90); // 45 + 25 + 20
    expect(r.reasons).toHaveLength(3);
  });
  it('stare konto, awatar, zwykła nazwa → 0 i brak powodów', () => {
    const r = scoreMember({
      ageDays: 400,
      noAvatar: false,
      nameSuspicious: false,
      altAgeThresholdDays: 7,
      weighNoAvatar: true,
    });
    expect(r.score).toBe(0);
    expect(r.reasons).toEqual([]);
  });
  it('próg wieku 0 → wiek nieoceniany', () => {
    const r = scoreMember({
      ageDays: 0.1,
      noAvatar: false,
      nameSuspicious: false,
      altAgeThresholdDays: 0,
      weighNoAvatar: true,
    });
    expect(r.score).toBe(0);
  });
  it('wynik przycięty do 100', () => {
    const r = scoreMember({
      ageDays: 0,
      noAvatar: true,
      nameSuspicious: true,
      altAgeThresholdDays: 30,
      weighNoAvatar: true,
    });
    expect(r.score).toBeLessThanOrEqual(100);
  });
});

describe('cross-server threat intel — hash + store', () => {
  it('threatHash deterministyczny, 16 hex, różny dla różnych ID', () => {
    expect(threatHash('123')).toBe(threatHash('123'));
    expect(threatHash('123')).toMatch(/^[0-9a-f]{16}$/);
    expect(threatHash('123')).not.toBe(threatHash('124'));
  });
  it('isKnownThreat: trafienie po hashu (nie po surowym ID)', () => {
    const store = [threatHash('raider1')];
    expect(isKnownThreat(threatHash('raider1'), store)).toBe(true);
    expect(isKnownThreat(threatHash('niewinny'), store)).toBe(false);
  });
  it('pushThreat dodaje + deduplikuje', () => {
    let s: string[] = [];
    s = pushThreat(s, 'a');
    s = pushThreat(s, 'a');
    s = pushThreat(s, 'b');
    expect(s).toEqual(['a', 'b']);
  });
  it('pushThreat przycina do cap (zostają najnowsze)', () => {
    expect(pushThreat(['x', 'y'], 'z', 2)).toEqual(['y', 'z']);
  });
});
