import { describe, expect, it } from 'vitest';
import { parseTempvoiceState } from './tempvoice.mts';

describe('parseTempvoiceState — rehydracja stanu po restarcie', () => {
  it('poprawny obiekt channelId→ownerId', () => {
    expect(parseTempvoiceState('{"c1":"u1","c2":"u2"}')).toEqual({ c1: 'u1', c2: 'u2' });
  });

  it('null / nie-JSON / nie-obiekt → {}', () => {
    expect(parseTempvoiceState(null)).toEqual({});
    expect(parseTempvoiceState('nie-json')).toEqual({});
    expect(parseTempvoiceState('[]')).toEqual({});
    expect(parseTempvoiceState('"tekst"')).toEqual({});
  });

  it('odfiltrowuje wpisy o nie-stringowej wartości (zły kształt)', () => {
    expect(parseTempvoiceState('{"c1":"u1","c2":123,"c3":null}')).toEqual({ c1: 'u1' });
  });
});
