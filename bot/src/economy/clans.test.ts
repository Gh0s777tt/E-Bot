// Rygiel silnika klanów (czyste funkcje). KLUCZE: nazwa walidowana/normalizowana; klucz klanu jest
// deterministyczny, URL-safe i NIEZALEŻNY od alfabetu (cyrylica/CJK nie dają pustego klucza, w
// przeciwieństwie do slugifikacji ASCII); ranking malejąco wg banku jest stabilny; dotacja walidowana.
import { describe, expect, it } from 'vitest';
import {
  type Clan,
  clanKey,
  clanRankByBank,
  donationError,
  MAX_CLAN_NAME,
  MIN_CLAN_NAME,
  normalizeClanName,
  roleAssignableError,
  sortClansByBank,
  transferError,
} from './clans.mts';

const clan = (o: Partial<Clan>): Clan => ({
  guild_id: 'g',
  id: 'x',
  name: 'X',
  owner_id: 'o',
  bank: 0,
  created_at: null,
  role_id: null,
  ...o,
});

describe('normalizeClanName', () => {
  it('przycina i zwija wewnętrzne spacje', () => {
    expect(normalizeClanName('  Nocne   Wilki  ')).toBe('Nocne Wilki');
  });

  it('odrzuca za krótkie i za długie', () => {
    expect(normalizeClanName('ab'.slice(0, MIN_CLAN_NAME - 1))).toBeNull();
    expect(normalizeClanName('a'.repeat(MAX_CLAN_NAME + 1))).toBeNull();
  });

  it('akceptuje nazwę w granicach', () => {
    expect(normalizeClanName('Smoki')).toBe('Smoki');
  });
});

describe('clanKey — deterministyczny, URL-safe, niezależny od alfabetu', () => {
  it('ten sam (po normalizacji) → ten sam klucz; ignoruje wielkość liter i spacje', () => {
    expect(clanKey('Nocne Wilki')).toBe(clanKey('  nocne   wilki '));
  });

  it('różne nazwy → różne klucze', () => {
    expect(clanKey('Smoki')).not.toBe(clanKey('Wilki'));
  });

  it('zawsze URL-safe (tylko [0-9a-z]) i niepusty — także dla cyrylicy/CJK', () => {
    for (const n of ['Wojownicy', 'Воины', '戦士', 'محاربون', '🐉 Klan']) {
      const k = clanKey(n);
      expect(k.length).toBeGreaterThan(0);
      expect(k).toMatch(/^[0-9a-z]+$/);
    }
  });
});

describe('sortClansByBank / clanRankByBank', () => {
  const clans = [
    clan({ id: 'a', name: 'Alfa', bank: 100 }),
    clan({ id: 'b', name: 'Beta', bank: 500 }),
    clan({ id: 'c', name: 'Gamma', bank: 500 }),
  ];

  it('maleje wg banku, remis → nazwa rosnąco', () => {
    expect(sortClansByBank(clans).map((c) => c.id)).toEqual(['b', 'c', 'a']);
  });

  it('nie mutuje wejścia', () => {
    const copy = [...clans];
    sortClansByBank(clans);
    expect(clans).toEqual(copy);
  });

  it('ranking 1-based; najbogatszy = 1, nieznany = 0', () => {
    expect(clanRankByBank(clans, 'b')).toBe(1);
    expect(clanRankByBank(clans, 'a')).toBe(3);
    expect(clanRankByBank(clans, 'zzz')).toBe(0);
  });
});

describe('donationError', () => {
  it('odrzuca kwoty nie-dodatnie i niecałkowite', () => {
    expect(donationError(0, 1000)).toBe('amount');
    expect(donationError(-5, 1000)).toBe('amount');
    expect(donationError(1.5, 1000)).toBe('amount');
  });

  it('odrzuca brak środków', () => {
    expect(donationError(2000, 1000)).toBe('funds');
  });

  it('przepuszcza poprawną dotację (≤ portfel)', () => {
    expect(donationError(1000, 1000)).toBeNull();
    expect(donationError(250, 1000)).toBeNull();
  });
});

describe('transferError — przekazanie przywództwa', () => {
  it('tylko lider może przekazać', () => {
    expect(transferError('owner', 'ktos', 'cel', true)).toBe('notOwner');
  });

  it('nie można przekazać samemu sobie (cel = obecny lider)', () => {
    expect(transferError('owner', 'owner', 'owner', true)).toBe('self');
  });

  it('cel musi należeć do klanu', () => {
    expect(transferError('owner', 'owner', 'obcy', false)).toBe('notMember');
  });

  it('poprawne przekazanie liderowi → null', () => {
    expect(transferError('owner', 'owner', 'czlonek', true)).toBeNull();
  });
});

describe('roleAssignableError — walidacja roli klanu przed nadaniem', () => {
  const ok = { id: 'r1', managed: false, position: 5 };

  it('@everyone (id = guildId) odrzucone', () => {
    expect(roleAssignableError({ ...ok, id: 'g1' }, 10, 'g1')).toBe('everyone');
  });

  it('rola zarządzana (bot/integracja/boost) odrzucona', () => {
    expect(roleAssignableError({ ...ok, managed: true }, 10, 'g1')).toBe('managed');
  });

  it('rola ≥ najwyższej roli bota → tooHigh (Discord odrzuci nadanie)', () => {
    expect(roleAssignableError({ ...ok, position: 10 }, 10, 'g1')).toBe('tooHigh');
    expect(roleAssignableError({ ...ok, position: 11 }, 10, 'g1')).toBe('tooHigh');
  });

  it('rola zwykła poniżej bota → null (można użyć)', () => {
    expect(roleAssignableError(ok, 10, 'g1')).toBeNull();
  });
});
