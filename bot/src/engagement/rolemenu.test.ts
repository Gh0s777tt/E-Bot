// Rygiel menu ról (roleMenuConfig · buildRoleMenu). Discord ma TWARDE limity dla select-menu:
// max 25 opcji, label ≤100, placeholder ≤150, description ≤100 znaków — przekroczenie = API ODRZUCA
// publikację menu (komenda /rolemenu pada). Te limity i filtr opcji bez roleId muszą być zaryglowane.
// Realny SQLite (tymczasowy DATABASE_PATH), bez sieci.
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { guildKey, setSettingLocal } from '../lib/db.mts';
import { buildRoleMenu, roleMenuConfig } from './rolemenu.mts';

const DB = path.join(tmpdir(), `ebot-rolemenu-${process.pid}.db`);
const write = (gid: string, cfg: unknown) =>
  setSettingLocal(guildKey(gid, 'rolemenu_config'), JSON.stringify(cfg));

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
  if (existsSync(DB)) rmSync(DB);
});
afterAll(() => {
  if (existsSync(DB)) rmSync(DB);
  delete process.env.DATABASE_PATH;
});

describe('roleMenuConfig — parsowanie + limity', () => {
  it('brak configu → bezpieczne domyślne (komunikat/placeholder, 0 opcji)', () => {
    const c = roleMenuConfig('rm-none');
    expect(c.options).toEqual([]);
    expect(c.message).toBeTruthy();
    expect(c.placeholder).toBeTruthy();
  });

  it('odrzuca opcje bez roleId', () => {
    write('rm-filter', {
      options: [{ label: 'A', roleId: '1' }, { label: 'B' }, { label: 'C', roleId: '3' }],
    });
    expect(roleMenuConfig('rm-filter').options.map((o) => o.roleId)).toEqual(['1', '3']);
  });

  it('RYGIEL: kapuje do 25 opcji (twardy limit Discorda)', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ label: `R${i}`, roleId: String(i) }));
    write('rm-cap', { options: many });
    expect(roleMenuConfig('rm-cap').options).toHaveLength(25);
  });

  it('uszkodzony JSON → domyślne (bez wyjątku)', () => {
    setSettingLocal(guildKey('rm-broken', 'rolemenu_config'), '{ to nie json');
    expect(roleMenuConfig('rm-broken').options).toEqual([]);
  });

  it('izolacja per-serwer: opcje A nie przeciekają do B', () => {
    write('rm-A', { options: [{ label: 'A', roleId: 'ra' }] });
    expect(roleMenuConfig('rm-A').options).toHaveLength(1);
    expect(roleMenuConfig('rm-B').options).toEqual([]); // B bez configu
  });
});

describe('buildRoleMenu — budowa select-menu z limitami Discorda', () => {
  it('brak opcji → null (nie publikujemy pustego menu)', () => {
    expect(buildRoleMenu('rm-empty')).toBeNull();
  });

  it('customId, minValues 0, maxValues = liczba opcji', () => {
    write('rm-build', {
      options: [
        { label: 'A', roleId: '1' },
        { label: 'B', roleId: '2' },
      ],
    });
    const menu = buildRoleMenu('rm-build')?.toJSON().components[0];
    expect(menu?.custom_id).toBe('rolemenu');
    expect(menu?.min_values).toBe(0);
    expect(menu?.max_values).toBe(2);
    expect(menu?.options.map((o) => o.value)).toEqual(['1', '2']);
  });

  it('RYGIEL: label ≤100, placeholder ≤150, description ≤100 (przycięte do limitów)', () => {
    write('rm-trunc', {
      placeholder: 'p'.repeat(300),
      options: [{ label: 'L'.repeat(300), roleId: '1', description: 'D'.repeat(300) }],
    });
    const menu = buildRoleMenu('rm-trunc')?.toJSON().components[0];
    expect(menu?.placeholder?.length).toBe(150);
    expect(menu?.options[0].label.length).toBe(100);
    expect(menu?.options[0].description?.length).toBe(100);
  });
});
