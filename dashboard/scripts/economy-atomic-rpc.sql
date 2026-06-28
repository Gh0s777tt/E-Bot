-- Atomowe operacje ekonomii (anty-wyścig na saldach). Bot woła je przez PostgREST /rpc/<fn>
-- (cloudRpc). Read-modify-write w aplikacji może się ścigać (dwie komendy czytają to samo saldo →
-- ostatni zapis wygrywa = podwójne wydanie). Te funkcje robią UPDATE warunkowy ATOMOWO w bazie.
-- Bot ma fallback do read-modify-write (gdy funkcja niewgrana), więc to ulepszenie jest ADDYTYWNE.

-- Atomowy debet warunkowy: odejmij p_amount od portfela JEŚLI wystarcza. Zwraca nowe saldo lub NULL
-- (brak wiersza lub za mało środków). Pozwala na bezpieczny check-and-spend bez wyścigu.
create or replace function economy_spend(p_guild text, p_user text, p_amount integer)
returns integer language plpgsql as $$
declare new_wallet integer;
begin
  update economy_users set wallet = wallet - p_amount, updated_at = now()
  where guild_id = p_guild and user_id = p_user and wallet >= p_amount
  returning wallet into new_wallet;
  return new_wallet;
end; $$;

-- Atomowy kredyt (upsert): dodaj p_amount do portfela (utwórz wiersz jeśli brak). Zwraca nowe saldo.
-- username aktualizowany tylko gdy podany niepusty (nie nadpisujemy istniejącego pustym).
create or replace function economy_credit(p_guild text, p_user text, p_username text, p_amount integer)
returns integer language plpgsql as $$
declare new_wallet integer;
begin
  insert into economy_users (guild_id, user_id, username, wallet, updated_at)
  values (p_guild, p_user, p_username, p_amount, now())
  on conflict (guild_id, user_id) do update
    set wallet = economy_users.wallet + p_amount,
        username = coalesce(nullif(excluded.username, ''), economy_users.username),
        updated_at = now()
  returning wallet into new_wallet;
  return new_wallet;
end; $$;

-- Atomowy ruch portfel↔bank: p_amount>0 = wpłata (portfel→bank, wymaga wallet>=amount),
-- p_amount<0 = wypłata (bank→portfel, wymaga bank>=|amount|). Zwraca nowe saldo portfela lub NULL.
create or replace function economy_move(p_guild text, p_user text, p_amount integer)
returns integer language plpgsql as $$
declare new_wallet integer;
begin
  if p_amount > 0 then
    update economy_users set wallet = wallet - p_amount, bank = bank + p_amount, updated_at = now()
    where guild_id = p_guild and user_id = p_user and wallet >= p_amount
    returning wallet into new_wallet;
  else
    update economy_users set wallet = wallet - p_amount, bank = bank + p_amount, updated_at = now()
    where guild_id = p_guild and user_id = p_user and bank >= -p_amount
    returning wallet into new_wallet;
  end if;
  return new_wallet;
end; $$;
