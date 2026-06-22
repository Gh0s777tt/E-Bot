// Rygiel kodeka recept Architekta (encodeRecipe/decodeRecipe) — udostępnialny kod base64 setupu.
// Krytyczny niezmiennik bezpieczeństwa: decode FILTRUJE przez whitelistę (BLUEPRINT_MODULES / PROV_BLOCKS)
// — udostępniony kod NIE może wstrzyknąć dowolnego modułu/bloku do prowizjonowania. Round-trip musi
// zachować dane, a pusty/uszkodzony/„same-nieznane" → null. Valid id-y bierzemy z presetu (anty-hardcode).
import { describe, expect, it } from 'vitest';
import { BLUEPRINT_MODULES, decodeRecipe, encodeRecipe, PROV_BLOCKS } from './setup';

// Valid id-y bierzemy z DOKŁADNIE tych whitelist, względem których filtruje decodeRecipe.
const validModule = BLUEPRINT_MODULES[0];
const validBlock = PROV_BLOCKS[0].id;

describe('encode/decodeRecipe — round-trip', () => {
  it('zakodowanie i odkodowanie zachowuje moduły i bloki', () => {
    const recipe = { modules: [validModule, BLUEPRINT_MODULES[1]], blocks: [validBlock] };
    const out = decodeRecipe(encodeRecipe(recipe));
    expect(out).toEqual(recipe);
  });

  it('akceptuje kod z białymi znakami (trim)', () => {
    const code = encodeRecipe({ modules: [validModule], blocks: [] });
    expect(decodeRecipe(`  ${code}  `)?.modules).toEqual([validModule]);
  });
});

describe('decodeRecipe — whitelist (anty-wstrzyknięcie)', () => {
  it('RYGIEL: nieznany moduł jest odfiltrowany (zostają tylko z BLUEPRINT_MODULES)', () => {
    const code = btoa(JSON.stringify({ m: [validModule, 'NIE_ISTNIEJE_module'], b: [] }));
    expect(decodeRecipe(code)?.modules).toEqual([validModule]);
  });

  it('RYGIEL: nieznany blok jest odfiltrowany (zostają tylko z PROV_BLOCKS)', () => {
    const code = btoa(JSON.stringify({ m: [], b: [validBlock, 'nie_istnieje_block'] }));
    expect(decodeRecipe(code)?.blocks).toEqual([validBlock]);
  });
});

describe('decodeRecipe — wejścia degenerujące → null', () => {
  it('pusta recepta (puste m i b) → null', () => {
    expect(decodeRecipe(btoa(JSON.stringify({ m: [], b: [] })))).toBeNull();
  });

  it('same nieznane id → po filtrze puste → null', () => {
    expect(decodeRecipe(btoa(JSON.stringify({ m: ['xxx'], b: ['yyy'] })))).toBeNull();
  });

  it('uszkodzony base64 / nie-JSON / pusty → null (bez wyjątku)', () => {
    expect(decodeRecipe('!!!nie-base64!!!')).toBeNull();
    expect(decodeRecipe(btoa('to nie json'))).toBeNull();
    expect(decodeRecipe('')).toBeNull();
  });
});
