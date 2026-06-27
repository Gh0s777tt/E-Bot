-- Perf (OPCJONALNE): agregacja „Top aktywni" po stronie Postgresa zamiast skanu całego okna
-- user_activity + sumowania w JS w panelu (`dashboard/lib/public.ts` → topActive, publiczny
-- `/p/leaderboard`). Postgres GROUP BY + ORDER + LIMIT zwraca od razu top-N.
--
-- Uruchom RAZ w Supabase → SQL Editor. Kod NAJPIERW próbuje tej funkcji, a gdy jej nie ma — wraca
-- do skanu+JS (zero regresji bez tego pliku). Czysto perf-only; bezpieczne do pominięcia.
--
-- security INVOKER (domyślnie): panel woła przez service_role (omija RLS) — globalna agregacja jak
-- dotychczas. user_activity.day jest TEXT 'YYYY-MM-DD' (porównanie leksykograficzne = chronologiczne).

create or replace function top_active(p_days int default 30, p_limit int default 15)
returns table (user_id text, username text, value bigint, voice_min bigint)
language sql
stable
as $$
  select
    user_id,
    max(username)                       as username,
    coalesce(sum(messages), 0)::bigint  as value,
    coalesce(sum(voice_min), 0)::bigint as voice_min
  from user_activity
  where day >= to_char((now() at time zone 'UTC')::date - greatest(p_days - 1, 0), 'YYYY-MM-DD')
  group by user_id
  order by value desc
  limit p_limit;
$$;
