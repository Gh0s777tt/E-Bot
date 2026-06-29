import { describe, expect, it } from 'vitest';
import { expiredMessageIds } from './autodelete.mts';

const NOW = 1_700_000_000_000;
const min = (m: number) => m * 60_000;
const day = (d: number) => d * 24 * 60 * 60_000;

describe('expiredMessageIds', () => {
  const msgs = [
    { id: 'fresh', createdTimestamp: NOW - min(10), pinned: false }, // za młoda
    { id: 'old', createdTimestamp: NOW - min(120), pinned: false }, // do kasacji
    { id: 'pinned', createdTimestamp: NOW - min(120), pinned: true }, // przypięta → pomiń
    { id: 'ancient', createdTimestamp: NOW - day(20), pinned: false }, // > 14 dni → pomiń
  ];

  it('zwraca tylko nieprzypięte starsze niż TTL i młodsze niż 14 dni', () => {
    expect(expiredMessageIds(msgs, min(60), NOW)).toEqual(['old']);
  });

  it('TTL = 0 → nic nie kasuje', () => {
    expect(expiredMessageIds(msgs, 0, NOW)).toEqual([]);
  });

  it('krótki TTL łapie więcej (ale nadal pomija przypięte i prastare)', () => {
    expect(expiredMessageIds(msgs, min(5), NOW)).toEqual(['fresh', 'old']);
  });

  it('TTL większy niż wiek wszystkich → pusto', () => {
    expect(expiredMessageIds(msgs, min(1000), NOW)).toEqual([]);
  });
});
