import { describe, expect, it } from 'vitest';
import { sendNowRequest } from './scheduledPosts.mts';

const raw = (id: string, ts: number) => JSON.stringify({ id, ts });

describe('sendNowRequest', () => {
  it('nowe żądanie (brak znacznika lub starszy) → {id, ts}', () => {
    expect(sendNowRequest(raw('p1', 100), {})).toEqual({ id: 'p1', ts: 100 });
    expect(sendNowRequest(raw('p1', 200), { 'sendnow:p1': 100 })).toEqual({ id: 'p1', ts: 200 });
  });

  it('obsłużone żądanie (znacznik ≥ ts) → null — bez pętli wysyłek', () => {
    expect(sendNowRequest(raw('p1', 100), { 'sendnow:p1': 100 })).toBeNull();
    expect(sendNowRequest(raw('p1', 100), { 'sendnow:p1': 150 })).toBeNull();
  });

  it('znacznik harmonogramu (state[id]) NIE blokuje ręcznej wysyłki', () => {
    expect(sendNowRequest(raw('p1', 100), { p1: 999 })).toEqual({ id: 'p1', ts: 100 });
  });

  it('brak/zepsute żądanie → null', () => {
    expect(sendNowRequest(null, {})).toBeNull();
    expect(sendNowRequest('nie-json', {})).toBeNull();
    expect(sendNowRequest(JSON.stringify({ id: '', ts: 1 }), {})).toBeNull();
    expect(sendNowRequest(JSON.stringify({ id: 'p1', ts: 'x' }), {})).toBeNull();
  });
});
