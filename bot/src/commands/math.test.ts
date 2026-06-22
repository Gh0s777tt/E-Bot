// Rygiel bezpiecznego kalkulatora /math (safeEval) — wyłoniony behavior-preserving z `execute`.
// KLUCZ: komenda używa `new Function`, więc TWARDY whitelist znaków to bariera anty-injection — bez
// liter żadne wyrażenie nie sięgnie globali ani nie odpali funkcji; wynik musi być SKOŃCZONĄ liczbą
// (1/0→Infinity, 0/0→NaN odrzucone); zaokrąglenie tnie szum float. Regresja = RCE albo „Infinity" w
// odpowiedzi bota.
import { describe, expect, it } from 'vitest';
import { safeEval } from './math.mts';

describe('safeEval — bezpieczny kalkulator /math', () => {
  it('liczy poprawną arytmetykę', () => {
    expect(safeEval('2*(3+4)/7')).toBe('2');
    expect(safeEval('10%3')).toBe('1');
    expect(safeEval('100-58')).toBe('42');
  });

  it('RYGIEL anti-injection: wyrażenia ze znakami spoza whitelisty → null (NIE wykonane)', () => {
    expect(safeEval('process')).toBeNull();
    expect(safeEval('alert(1)')).toBeNull();
    expect(safeEval('1+a')).toBeNull();
    // liczbowe, ale groźne konstrukcje — odrzucone PRZED ewaluacją (znaki `=>{},[]` poza whitelistą)
    expect(safeEval('(()=>5)()')).toBeNull();
    expect(safeEval('[5][0]')).toBeNull();
    expect(safeEval('(1,2,3)')).toBeNull();
  });

  it('RYGIEL skończoności: 1/0 → Infinity i 0/0 → NaN odrzucone (null, nie „Infinity"/„NaN")', () => {
    expect(safeEval('1/0')).toBeNull();
    expect(safeEval('0/0')).toBeNull();
  });

  it('normalizuje symbole ×÷− na *​/-', () => {
    expect(safeEval('3×4')).toBe('12');
    expect(safeEval('6÷2')).toBe('3');
    expect(safeEval('5−2')).toBe('3');
  });

  it('RYGIEL zaokrąglenia: tnie szum zmiennoprzecinkowy (0.1+0.2 → 0.3)', () => {
    expect(safeEval('0.1+0.2')).toBe('0.3');
  });

  it('puste / same białe znaki → null', () => {
    expect(safeEval('')).toBeNull();
    expect(safeEval('   ')).toBeNull();
  });
});
