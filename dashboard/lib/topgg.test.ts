// Rygiel webhooka top.gg: kwota nagrody, weryfikacja podpisu (HMAC v1 + legacy + fail-closed)
// oraz normalizacja payloadu (v1 vote.create i legacy). Sterujemy env z przywróceniem po teście.
import crypto from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { normalizeVote, verifyWebhook, voteRewardAmount } from './topgg';

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
  it('override z env (×2 w weekend)', () => {
    process.env[R] = '50';
    expect(voteRewardAmount(false)).toBe(50);
    expect(voteRewardAmount(true)).toBe(100);
  });
  it('0 lub śmieci → brak nagrody', () => {
    process.env[R] = '0';
    expect(voteRewardAmount(true)).toBe(0);
    process.env[R] = 'abc';
    expect(voteRewardAmount(false)).toBe(0);
  });
});

describe('verifyWebhook — HMAC v1 + legacy + fail-closed', () => {
  const raw = '{"type":"vote.create"}';
  const sign = (t: string, secret: string) =>
    `t=${t},v1=${crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex')}`;

  it('fail-closed bez TOPGG_WEBHOOK_AUTH (oba modele)', () => {
    delete process.env[A];
    expect(verifyWebhook(raw, new Headers({ authorization: 'x' }))).toBe(false);
    expect(verifyWebhook(raw, new Headers({ 'x-topgg-signature': sign('1', 'x') }))).toBe(false);
  });
  it('v1 HMAC: poprawny podpis → true; zły sekret / zmieniony body → false', () => {
    process.env[A] = 's3cret';
    expect(verifyWebhook(raw, new Headers({ 'x-topgg-signature': sign('123', 's3cret') }))).toBe(
      true,
    );
    expect(verifyWebhook(raw, new Headers({ 'x-topgg-signature': sign('123', 'wrong') }))).toBe(
      false,
    );
    expect(
      verifyWebhook(`${raw} `, new Headers({ 'x-topgg-signature': sign('123', 's3cret') })),
    ).toBe(false);
  });
  it('legacy: Authorization == sekret', () => {
    process.env[A] = 's3cret';
    expect(verifyWebhook(raw, new Headers({ authorization: 's3cret' }))).toBe(true);
    expect(verifyWebhook(raw, new Headers({ authorization: 'nope' }))).toBe(false);
    expect(verifyWebhook(raw, new Headers())).toBe(false);
  });
});

describe('normalizeVote — v1 + legacy', () => {
  it('v1 vote.create → Discord ID z platform_id, weekend z weight', () => {
    const v = normalizeVote({
      type: 'vote.create',
      data: { user: { id: 'tg-internal', platform_id: '123' }, weight: 2 },
    });
    expect(v).toEqual({ userId: '123', isWeekend: true, isTest: false });
  });
  it('legacy { user, isWeekend, type }', () => {
    expect(normalizeVote({ user: '456', isWeekend: false, type: 'upvote' })).toEqual({
      userId: '456',
      isWeekend: false,
      isTest: false,
    });
    expect(normalizeVote({ user: '456', type: 'test' })?.isTest).toBe(true);
  });
  it('nierozpoznany payload → null', () => {
    expect(normalizeVote({})).toBe(null);
    expect(normalizeVote(null)).toBe(null);
  });
});
