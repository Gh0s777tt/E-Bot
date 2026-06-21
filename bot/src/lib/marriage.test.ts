// Rygiel logiki małżeństw (/marry) — magazyn symetryczny w settings 'marriages'.
// Krytyczne, dotąd nieprzetestowane niezmienniki:
//   • ZAPIS SYMETRYCZNY: setMarriage(A,B) tworzy oba wpisy (A→B i B→A) z TYM SAMYM `since`.
//   • LUSTRO przy rozwodzie: clearMarriage(A) kasuje wpis A i lustrzany wpis partnera —
//     ale TYLKO gdy partner nadal wskazuje na A (ochrona cudzego, nowego związku).
//   • IZOLACJA multi-tenant: związek serwera A nie przecieka do serwera B (klucz partycjonowany guildId).
// Gdyby ktoś popsuł symetrię (zapis jednostronny) albo zdjął strażnika lustra (bezwarunkowe delete) →
// rozwód jednego użytkownika skasowałby ŚWIEŻY związek innej pary. Realny SQLite (tymczasowy DATABASE_PATH), bez sieci.
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setSettingLocal } from './db.mts';
import { clearMarriage, getMarriage, setMarriage } from './marriage.mts';

const DB = path.join(tmpdir(), `ebot-marriage-${process.pid}.db`);
const G = '100000000000000001'; // serwer główny
const G2 = '200000000000000002'; // drugi serwer (izolacja)
const A = '111111111111111111';
const B = '222222222222222222';
const C = '333333333333333333';

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
});

beforeEach(() => {
  // Czysty magazyn przed każdym przypadkiem (jeden globalny blob 'marriages').
  setSettingLocal('marriages', '{}');
});

afterAll(() => {
  if (existsSync(DB)) rmSync(DB);
  delete process.env.DATABASE_PATH;
});

describe('marriage — zapis symetryczny i odczyt', () => {
  it('setMarriage tworzy oba kierunki (A→B i B→A)', () => {
    setMarriage(G, A, B);
    expect(getMarriage(G, A)?.partner).toBe(B);
    expect(getMarriage(G, B)?.partner).toBe(A);
  });

  it('oba lustrzane wpisy mają IDENTYCZNY znacznik czasu `since`', () => {
    setMarriage(G, A, B);
    const since = getMarriage(G, A)?.since;
    expect(typeof since).toBe('number');
    expect(since).toBeGreaterThan(0);
    expect(getMarriage(G, B)?.since).toBe(since);
  });

  it('getMarriage zwraca null, gdy użytkownik nie jest w związku', () => {
    expect(getMarriage(G, A)).toBeNull();
    setMarriage(G, A, B);
    expect(getMarriage(G, C)).toBeNull();
  });
});

describe('marriage — rozwód (clearMarriage)', () => {
  it('kasuje wpis użytkownika ORAZ lustro partnera, zwraca true', () => {
    setMarriage(G, A, B);
    expect(clearMarriage(G, A)).toBe(true);
    expect(getMarriage(G, A)).toBeNull();
    expect(getMarriage(G, B)).toBeNull(); // lustro też zniknęło
  });

  it('zwraca false, gdy użytkownik nie był w związku (brak skutków ubocznych)', () => {
    expect(clearMarriage(G, A)).toBe(false);
    setMarriage(G, A, B);
    expect(clearMarriage(G, C)).toBe(false);
    // Para A–B nietknięta przez nieudany rozwód osoby trzeciej.
    expect(getMarriage(G, A)?.partner).toBe(B);
    expect(getMarriage(G, B)?.partner).toBe(A);
  });

  it('RYGIEL strażnika lustra: rozwód po REMARIAGE nie kasuje świeżego związku partnera', () => {
    // A–B, następnie B wchodzi w nowy związek B–C (stary wpis A→B staje się jednostronny/nieaktualny).
    setMarriage(G, A, B);
    setMarriage(G, B, C);
    expect(getMarriage(G, B)?.partner).toBe(C);
    expect(getMarriage(G, C)?.partner).toBe(B);

    // Teraz A się "rozwodzi". Strażnik `g[partner]?.partner === user` musi rozpoznać, że
    // B nie wskazuje już na A → lustro B NIE może zostać skasowane.
    expect(clearMarriage(G, A)).toBe(true);
    expect(getMarriage(G, A)).toBeNull(); // jednostronny wpis A zniknął
    expect(getMarriage(G, B)?.partner).toBe(C); // świeży związek B–C ocalał
    expect(getMarriage(G, C)?.partner).toBe(B);
  });
});

describe('marriage — izolacja multi-tenant (per-serwer)', () => {
  it('związek z serwera G nie jest widoczny na serwerze G2', () => {
    setMarriage(G, A, B);
    expect(getMarriage(G2, A)).toBeNull();
    expect(getMarriage(G2, B)).toBeNull();
  });

  it('rozwód na jednym serwerze nie rusza tej samej pary na drugim', () => {
    setMarriage(G, A, B);
    setMarriage(G2, A, B);
    expect(clearMarriage(G, A)).toBe(true);
    expect(getMarriage(G, A)).toBeNull();
    // Ten sam duet na G2 pozostaje w związku.
    expect(getMarriage(G2, A)?.partner).toBe(B);
    expect(getMarriage(G2, B)?.partner).toBe(A);
  });
});
