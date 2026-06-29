// Czysta logika kolejki odwołań: które wpisać na kanał (pending + nieopublikowane).
import { describe, expect, it } from 'vitest';
import { type Appeal, pendingUnposted } from './appeals.mts';

const mk = (over: Partial<Appeal>): Appeal => ({
  id: 'a',
  userId: 'u',
  uname: 'User',
  reason: 'sorry',
  status: 'pending',
  at: 1,
  ...over,
});

describe('pendingUnposted — co opublikować na kanał recenzji', () => {
  it('tylko pending i nieopublikowane', () => {
    const q: Appeal[] = [
      mk({ id: '1', status: 'pending', posted: false }),
      mk({ id: '2', status: 'pending', posted: true }),
      mk({ id: '3', status: 'approved' }),
      mk({ id: '4', status: 'rejected' }),
      mk({ id: '5', status: 'pending' }), // posted undefined → świeże
    ];
    expect(pendingUnposted(q).map((a) => a.id)).toEqual(['1', '5']);
  });
  it('pusta kolejka → pusto', () => {
    expect(pendingUnposted([])).toEqual([]);
  });
});
