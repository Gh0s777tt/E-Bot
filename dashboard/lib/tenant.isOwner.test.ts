// Rygiel whitelisty właściciela instancji (isOwner) — owner = PEŁNY dostęp do wszystkich serwerów bota
// (bypass autoryzacji w guild.ts). Regresja = obcy uid dostaje owner-bypass, albo właściciel zablokowany.
// Lista z env DASHBOARD_OWNER_IDS (split "," + trim + filter pustych — przez authConfig). Sterujemy env.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isOwner } from './tenant';

const K = 'DASHBOARD_OWNER_IDS';
let prev: string | undefined;
beforeEach(() => {
  prev = process.env[K];
});
afterEach(() => {
  if (prev === undefined) delete process.env[K];
  else process.env[K] = prev;
});

describe('isOwner — przynależność do whitelisty', () => {
  it('uid na liście → true; spoza listy → false', () => {
    process.env[K] = '111,222,333';
    expect(isOwner('222')).toBe(true);
    expect(isOwner('444')).toBe(false);
  });

  it('RYGIEL: id-y są przycinane (spacje wokół wpisów env nie psują dopasowania)', () => {
    process.env[K] = '111,  222  , 333';
    expect(isOwner('222')).toBe(true); // bez trim: " 222 " !== "222" → false
  });

  it('puste segmenty (przecinki) odfiltrowane; pusty uid nie autoryzuje', () => {
    process.env[K] = '111,,222,';
    expect(isOwner('111')).toBe(true);
    expect(isOwner('222')).toBe(true);
    expect(isOwner('')).toBe(false); // pusty uid — nie matchuje odfiltrowanej listy
  });
});

describe('isOwner — fail-closed', () => {
  it('brak env (brak właścicieli) → nikt nie jest ownerem', () => {
    delete process.env[K];
    expect(isOwner('111')).toBe(false);
  });

  it('null / undefined / pusty uid → false (nawet przy ustawionych właścicielach)', () => {
    process.env[K] = '111,222';
    expect(isOwner(null)).toBe(false);
    expect(isOwner(undefined)).toBe(false);
    expect(isOwner('')).toBe(false);
  });
});
