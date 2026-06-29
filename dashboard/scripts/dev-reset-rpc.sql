-- Narzędzie developera — reset bazy (#645). Wołane TYLKO z panelu (service_role) po bramce właściciela.
--   dev_reset_all()         — TRUNCATE wszystkich tabel public (pełny wipe → stan świeżej instalacji).
--   dev_reset_guild(p_guild) — DELETE we wszystkich tabelach z kolumną guild_id = p_guild + config
--                              'g:<gid>:%' + sieroty (ticket_messages / giveaway_entries).
-- Auto-wykrywanie tabel (zero utrzymania listy). BEZPIECZEŃSTWO: security definer + EXECUTE odebrany
-- anon/authenticated, nadany tylko service_role (panel). Bez tego dowolny klient PostgREST mógłby wywołać.

create or replace function dev_reset_all() returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('truncate table public.%I restart identity cascade', r.tablename);
  end loop;
end;
$$;

create or replace function dev_reset_guild(p_guild text) returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if p_guild is null or p_guild = '' then return; end if;
  -- wszystkie tabele z kolumną guild_id → usuń wiersze tego serwera
  for r in
    select table_name from information_schema.columns
    where table_schema = 'public' and column_name = 'guild_id'
  loop
    execute format('delete from public.%I where guild_id = %L', r.table_name, p_guild);
  end loop;
  -- config per-serwer (override'y z prefiksem g:<gid>:)
  delete from public.settings where key like 'g:' || p_guild || ':%';
  -- sieroty po usuniętych rodzicach (tabele dzieci bez kolumny guild_id)
  delete from public.ticket_messages where ticket_id not in (select id from public.tickets);
  delete from public.giveaway_entries where giveaway_id not in (select id from public.giveaways);
end;
$$;

revoke all on function dev_reset_all() from public, anon, authenticated;
revoke all on function dev_reset_guild(text) from public, anon, authenticated;
grant execute on function dev_reset_all() to service_role;
grant execute on function dev_reset_guild(text) to service_role;
