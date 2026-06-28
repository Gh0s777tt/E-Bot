// Rygiel budowy URL OAuth (authorizeUrl + selfServeEnabled). Kluczowa decyzja prywatności/bezpieczeństwa:
// scope `guilds` prosimy TYLKO gdy self-serve włączone — inaczej minimalnie `identify`. Regresja =
// panel nadmiernie prosi o dostęp do listy serwerów (prywatność) albo self-serve nie dostaje `guilds`.
// Plus poprawny redirect_uri, response_type, prompt, przeniesienie `state`. Env sterowany z przywróceniem.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { authorizeUrl, selfServeEnabled } from './auth';

const CID = 'DISCORD_CLIENT_ID';
const SS = 'MARKETPLACE_SELF_SERVE';
let prevCid: string | undefined;
let prevSs: string | undefined;
beforeEach(() => {
  prevCid = process.env[CID];
  prevSs = process.env[SS];
  process.env[CID] = '123client';
});
afterEach(() => {
  if (prevCid === undefined) delete process.env[CID];
  else process.env[CID] = prevCid;
  if (prevSs === undefined) delete process.env[SS];
  else process.env[SS] = prevSs;
});

const parse = (origin = 'https://panel.example.com', state = 'st4te') =>
  new URL(authorizeUrl(origin, state));

describe('authorizeUrl — struktura i parametry', () => {
  it('wskazuje na endpoint OAuth Discorda', () => {
    const u = parse();
    expect(u.origin).toBe('https://discord.com');
    expect(u.pathname).toBe('/oauth2/authorize');
  });

  it('redirect_uri = origin + /api/auth/callback; response_type=code; prompt=consent; client_id z env', () => {
    const p = parse('https://panel.example.com').searchParams;
    expect(p.get('redirect_uri')).toBe('https://panel.example.com/api/auth/callback');
    expect(p.get('response_type')).toBe('code');
    expect(p.get('prompt')).toBe('consent');
    expect(p.get('client_id')).toBe('123client');
  });

  it('state przeniesione 1:1 (URLSearchParams koduje znaki specjalne)', () => {
    expect(parse('https://x', 'a b&c=d').searchParams.get('state')).toBe('a b&c=d');
  });
});

describe('authorizeUrl — RYGIEL scope wg self-serve', () => {
  it('self-serve DOMYŚLNIE WŁĄCZONE (brak env) → `identify guilds`', () => {
    delete process.env[SS];
    expect(selfServeEnabled()).toBe(true);
    expect(parse().searchParams.get('scope')).toBe('identify guilds');
  });

  it('self-serve wyłączone jawnie (=0) → tylko `identify` (minimalnie, bez guilds)', () => {
    process.env[SS] = '0';
    expect(selfServeEnabled()).toBe(false);
    expect(parse().searchParams.get('scope')).toBe('identify');
  });

  it('self-serve WŁĄCZONE jawnie (=1) → `identify guilds`', () => {
    process.env[SS] = '1';
    expect(selfServeEnabled()).toBe(true);
    expect(parse().searchParams.get('scope')).toBe('identify guilds');
  });
});
