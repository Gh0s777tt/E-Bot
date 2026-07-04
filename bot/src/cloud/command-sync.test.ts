import { describe, expect, it } from 'vitest';
import { pendingRequestTs } from './command-sync.logic.mts';

const req = (ts: number) => JSON.stringify({ ts });
const res = (requestTs: number) => JSON.stringify({ ok: true, requestTs });

describe('pendingRequestTs', () => {
  it('nowe żądanie (brak wyniku lub wynik starszy) → zwraca ts', () => {
    expect(pendingRequestTs(req(100), null)).toBe(100);
    expect(pendingRequestTs(req(200), res(100))).toBe(200);
  });

  it('obsłużone żądanie (wynik z requestTs ≥ ts) → null (idempotencja po restarcie)', () => {
    expect(pendingRequestTs(req(100), res(100))).toBeNull();
    expect(pendingRequestTs(req(100), res(150))).toBeNull();
  });

  it('brak/zepsute żądanie → null; zepsuty wynik nie blokuje żądania', () => {
    expect(pendingRequestTs(null, null)).toBeNull();
    expect(pendingRequestTs('nie-json', null)).toBeNull();
    expect(pendingRequestTs(JSON.stringify({ ts: 'x' }), null)).toBeNull();
    expect(pendingRequestTs(req(100), 'nie-json')).toBe(100);
  });
});
