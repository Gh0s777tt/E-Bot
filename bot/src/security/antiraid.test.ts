// Test detekcji fali wejść anti-raid (detectWave) — czysty predykat wydzielony z handlera. Regresja =
// raid przepuszczony (za wysoki próg / złe okno) albo fałszywa fala (ban niewinnych przy zwykłym ruchu).
import { describe, expect, it } from 'vitest';
import { detectWave } from './antiraid.mts';

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
