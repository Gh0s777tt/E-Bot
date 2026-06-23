// Rygiel agregacji statystyk ticketów (ticketStats) — liczy zgłoszenia wg statusu (open/claimed/closed)
// na pulpicie panelu. KLUCZ: każdy kubełek liczony przez DOKŁADNE dopasowanie statusu; status spoza
// trójki (np. 'pending') NIE wpada do żadnego kubełka (inaczej zawyżona/zafałszowana statystyka).
// Pusta lista → same zera. Regresja = błędne liczniki ticketów w panelu.
import { describe, expect, it } from 'vitest';
import { type TicketRow, ticketStats } from './faza4';

const row = (status: string): TicketRow => ({
  id: status,
  channel_id: null,
  user_id: 'u',
  username: null,
  subject: null,
  status,
  claimed_by: null,
  created_at: '2026-06-23',
  closed_at: null,
  rating: null,
});

describe('ticketStats — liczniki ticketów wg statusu', () => {
  it('liczy open/claimed/closed po dokładnym statusie', () => {
    // celowo open ≠ liczba „nie-open" (3 vs 2), by wykryć też odwrócenie dopasowania `=== 'open'`
    const stats = ticketStats([
      row('open'),
      row('open'),
      row('open'),
      row('claimed'),
      row('closed'),
    ]);
    expect(stats).toEqual({ open: 3, claimed: 1, closed: 1 });
  });

  it('pusta lista → same zera', () => {
    expect(ticketStats([])).toEqual({ open: 0, claimed: 0, closed: 0 });
  });

  it('RYGIEL: status spoza trójki nie wpada do żadnego kubełka', () => {
    expect(ticketStats([row('pending'), row('open')])).toEqual({ open: 1, claimed: 0, closed: 0 });
  });
});
