// Rygiel „najaktywniejszego" tygodniowego digestu (topUserByMessages) — wyłoniony behavior-preserving
// z `maybePost`. KLUCZ: grupuje wiersze user_activity po user_id i SUMUJE wiadomości z wielu dni
// (jeden wiersz/dzień), wyłania lidera (sort MALEJĄCO), rozwiązuje nazwę (username z dowolnego wiersza
// > fallback user_id). Regresja = digest chwali złą osobę albo pokazuje surowe id zamiast nicku.
import { describe, expect, it } from 'vitest';
import {
  coolingMembers,
  memberFunnel,
  mostImproved,
  percentileRank,
  topUserByMessages,
  trend,
  trendLabel,
} from './digest.mts';

describe('topUserByMessages — lider aktywności tygodnia', () => {
  it('SUMUJE wiadomości tego samego usera z wielu dni', () => {
    const top = topUserByMessages([
      { user_id: 'a', username: 'Ala', messages: 5 },
      { user_id: 'a', username: 'Ala', messages: 3 },
    ]);
    expect(top).toEqual({ name: 'Ala', msgs: 8 });
  });

  it('RYGIEL rankingu: zwraca usera z największą sumą (malejąco)', () => {
    const top = topUserByMessages([
      { user_id: 'a', username: 'Ala', messages: 8 },
      { user_id: 'b', username: 'Bob', messages: 10 },
    ]);
    expect(top?.name).toBe('Bob');
  });

  it('RYGIEL nazwy: username z DOWOLNEGO wiersza wygrywa z fallbackiem user_id', () => {
    // pierwszy wiersz bez nicku (name=user_id), drugi z nickiem → nick wygrywa
    const top = topUserByMessages([
      { user_id: 'x', messages: 2 },
      { user_id: 'x', username: 'Ghost', messages: 1 },
    ]);
    expect(top).toEqual({ name: 'Ghost', msgs: 3 });
  });

  it('fallback nazwy na user_id, gdy żaden wiersz nie ma username', () => {
    expect(topUserByMessages([{ user_id: '123', messages: 4 }])?.name).toBe('123');
  });

  it('messages brakujące liczone jako 0 (bez NaN)', () => {
    const top = topUserByMessages([
      { user_id: 'a', username: 'Ala' },
      { user_id: 'a', username: 'Ala', messages: 7 },
    ]);
    expect(top?.msgs).toBe(7);
  });

  it('pusta lista → undefined (brak najaktywniejszego)', () => {
    expect(topUserByMessages([])).toBeUndefined();
  });
});

describe('coolingMembers — stygnący (wczesny churn-risk)', () => {
  it('aktywny przed splitem, cisza po → stygnący', () => {
    const out = coolingMembers(
      [
        { user_id: 'a', username: 'Ala', messages: 5, day: '2026-06-20' },
        { user_id: 'a', username: 'Ala', messages: 0, day: '2026-06-25' },
      ],
      '2026-06-24',
    );
    expect(out).toEqual([{ name: 'Ala', before: 5 }]);
  });

  it('aktywny też po splicie → NIE stygnący', () => {
    const out = coolingMembers(
      [
        { user_id: 'b', messages: 5, day: '2026-06-20' },
        { user_id: 'b', messages: 2, day: '2026-06-25' },
      ],
      '2026-06-24',
    );
    expect(out).toEqual([]);
  });

  it('sort malejąco po wcześniejszych wiadomościach', () => {
    const out = coolingMembers(
      [
        { user_id: 'a', username: 'Ala', messages: 3, day: '2026-06-20' },
        { user_id: 'b', username: 'Bob', messages: 9, day: '2026-06-20' },
      ],
      '2026-06-24',
    );
    expect(out.map((u) => u.name)).toEqual(['Bob', 'Ala']);
  });

  it('aktywny dopiero po splicie (nowy) → pomijany', () => {
    expect(
      coolingMembers([{ user_id: 'c', messages: 4, day: '2026-06-25' }], '2026-06-24'),
    ).toEqual([]);
  });
});

describe('memberFunnel — lejek nowych (dołączyli → napisali → zostali)', () => {
  it('liczy aktywację (w zbiorze aktywnych) i retencję (brak left_at)', () => {
    const joiners = [
      { user_id: 'a', left_at: null },
      { user_id: 'b', left_at: '2026-06-25T00:00:00Z' },
      { user_id: 'c' },
    ];
    expect(memberFunnel(joiners, new Set(['a']))).toEqual({ joined: 3, activated: 1, retained: 2 });
  });

  it('brak dołączeń → same zera', () => {
    expect(memberFunnel([], new Set())).toEqual({ joined: 0, activated: 0, retained: 0 });
  });

  it('nikt nie napisał → activated 0, retencja niezależna', () => {
    expect(memberFunnel([{ user_id: 'x' }, { user_id: 'y' }], new Set())).toEqual({
      joined: 2,
      activated: 0,
      retained: 2,
    });
  });
});

describe('trend — benchmark okres-do-okresu', () => {
  it('wzrost → strzałka ▲ i dodatni %', () => {
    expect(trend(120, 100)).toEqual({ delta: 20, pct: 20, arrow: '▲' });
  });

  it('spadek → ▼ i ujemny %', () => {
    expect(trend(80, 100)).toEqual({ delta: -20, pct: -20, arrow: '▼' });
  });

  it('bez zmian → ▬ i 0%', () => {
    expect(trend(100, 100)).toEqual({ delta: 0, pct: 0, arrow: '▬' });
  });

  it('brak bazy (poprzednio 0) → pct null (bez dzielenia przez 0)', () => {
    expect(trend(50, 0)).toEqual({ delta: 50, pct: null, arrow: '▲' });
    expect(trend(0, 0)).toEqual({ delta: 0, pct: null, arrow: '▬' });
  });
});

describe('trendLabel — etykieta trendu do embeda', () => {
  it('z bazą → strzałka + %', () => {
    expect(trendLabel(trend(120, 100))).toBe('▲ +20%');
    expect(trendLabel(trend(80, 100))).toBe('▼ -20%');
    expect(trendLabel(trend(100, 100))).toBe('▬ 0%');
  });

  it('bez bazy: przyrost → 🆕 +N, oba zerowe → ▬', () => {
    expect(trendLabel(trend(50, 0))).toBe('🆕 +50');
    expect(trendLabel(trend(0, 0))).toBe('▬');
  });
});

describe('mostImproved — największy skok aktywności (per-user, okno do okna)', () => {
  it('wyłania największy DODATNI przyrost wiadomości', () => {
    const prev = [
      { user_id: 'a', username: 'Ala', messages: 10 },
      { user_id: 'b', username: 'Bob', messages: 50 },
    ];
    const cur = [
      { user_id: 'a', username: 'Ala', messages: 100 }, // +90
      { user_id: 'b', username: 'Bob', messages: 60 }, // +10
    ];
    expect(mostImproved(cur, prev)).toEqual({ name: 'Ala', before: 10, after: 100, delta: 90 });
  });

  it('SUMUJE wiele dni per-user w każdym oknie', () => {
    const cur = [
      { user_id: 'a', username: 'Ala', messages: 30 },
      { user_id: 'a', username: 'Ala', messages: 40 },
    ];
    expect(mostImproved(cur, [], 20)?.after).toBe(70);
  });

  it('przyrost < minDelta → undefined (filtr szumu)', () => {
    const cur = [{ user_id: 'a', username: 'Ala', messages: 25 }];
    const prev = [{ user_id: 'a', username: 'Ala', messages: 15 }]; // +10 < 20
    expect(mostImproved(cur, prev, 20)).toBeUndefined();
  });

  it('spadek aktywności ignorowany (tylko dodatnie skoki)', () => {
    const cur = [{ user_id: 'a', username: 'Ala', messages: 5 }];
    const prev = [{ user_id: 'a', username: 'Ala', messages: 80 }];
    expect(mostImproved(cur, prev)).toBeUndefined();
  });

  it('nowy aktywny (brak w poprzednim oknie) liczy się jako pełny przyrost', () => {
    expect(mostImproved([{ user_id: 'n', username: 'Nowy', messages: 60 }], [])?.delta).toBe(60);
  });
});

describe('percentileRank — benchmark cross-server', () => {
  it('% wartości MNIEJSZYCH niż value (0–100)', () => {
    // 100 jest większe od 4 z 5 wartości {10,20,30,40,100} → 80%
    expect(percentileRank(100, [10, 20, 30, 40, 100])).toBe(80);
    // 10 jest najmniejsze → 0% (nic poniżej)
    expect(percentileRank(10, [10, 20, 30, 40, 100])).toBe(0);
  });

  it('najwyższa wartość → blisko 100%', () => {
    expect(percentileRank(500, [1, 2, 3, 500])).toBe(75); // 3 z 4 poniżej
  });

  it('zbiór ≤ 1 elementu → 100 (brak próbki do porównania)', () => {
    expect(percentileRank(42, [42])).toBe(100);
    expect(percentileRank(42, [])).toBe(100);
  });
});
