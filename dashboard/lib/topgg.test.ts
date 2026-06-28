// Rygiel webhooka top.gg: kwota nagrody (weekend ×2, override z env, fail-safe na 0/śmieci)
// + autoryzacja webhooka (fail-closed bez sekretu). Sterujemy env z przywróceniem po teście.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { voteRewardAmount, webhookAuthorized } from './topgg';

const R = 'TOPGG_VOTE_REWARD';
const A = 'TOPGG_WEBHOOK_AUTH';
let prevR: string | undefined;
let prevA: string | undefined;
beforeEach(() => {
  prevR = process.env[R];
  prevA = process.env[A];
});
afterEach(() => {
  if (prevR === undefined) delete process.env[R];
  else process.env[R] = prevR;
  if (prevA === undefined) delete process.env[A];
  else process.env[A] = prevA;
});

describe('voteRewardAmount', () => {
  it('domyślnie 100, weekend ×2', () => {
    delete process.env[R];
    expect(voteRewardAmount(false)).toBe(100);
    expect(voteRewardAmount(true)).toBe(200);
  });
  it('nadpisanie z env (×2 w weekend)', () => {
    process.env[R] = '50';
    expect(voteRewardAmount(false)).toBe(50);
    expect(voteRewardAmount(true)).toBe(100);
  });
  it('0 lub śmieci → brak nagrody (0)', () => {
    process.env[R] = '0';
    expect(voteRewardAmount(true)).toBe(0);
    process.env[R] = 'abc';
    expect(voteRewardAmount(false)).toBe(0);
  });
});

describe('webhookAuthorized — fail-closed', () => {
  const req = (auth?: string) =>
    new Request(
      'http://x/api/topgg/webhook',
      auth === undefined ? undefined : { headers: { authorization: auth } },
    );
  it('bez TOPGG_WEBHOOK_AUTH → zawsze false (nawet z nagłówkiem)', () => {
    delete process.env[A];
    expect(webhookAuthorized(req('cokolwiek'))).toBe(false);
  });
  it('zgodny sekret → true; niezgodny/brak nagłówka → false', () => {
    process.env[A] = 's3cret';
    expect(webhookAuthorized(req('s3cret'))).toBe(true);
    expect(webhookAuthorized(req('wrong'))).toBe(false);
    expect(webhookAuthorized(req(undefined))).toBe(false);
  });
});
